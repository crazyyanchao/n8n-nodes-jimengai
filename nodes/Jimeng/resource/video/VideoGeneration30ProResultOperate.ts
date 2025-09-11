import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

// Helper function to generate MD5 hash for caching
function generateMD5(taskId: string, additionalParams: any): string {
	const content = JSON.stringify({ taskId, ...additionalParams });
	return crypto.createHash('md5').update(content).digest('hex');
}

// Helper function to check if cached file exists
function getCachedFilePath(md5: string, format: string, cacheDir: string): string {
	return path.join(cacheDir, `${md5}.${format}`);
}

// Helper function to ensure cache directory exists
function ensureCacheDir(cacheDir: string): void {
	if (!fs.existsSync(cacheDir)) {
		fs.mkdirSync(cacheDir, { recursive: true });
	}
}

// Helper function to download video from URL
async function downloadVideo(videoUrl: string): Promise<Buffer> {
	try {
		const response = await axios.get(videoUrl, {
			responseType: 'arraybuffer',
			timeout: 300000, // 5 minutes timeout
		});
		return Buffer.from(response.data);
	} catch (error: any) {
		throw new Error(`Failed to download video from URL: ${error.message}`);
	}
}

// Helper function to process video output based on format
function processVideoOutput(
	result: IDataObject,
	videoBuffer: Buffer,
	outputFormat: string,
	format: string,
	index: number,
	executeFunctions: IExecuteFunctions
): IDataObject {
	switch (outputFormat) {
		case 'base64':
			return {
				...result,
				videoData: videoBuffer.toString('base64'),
			};

		case 'buffer':
			return {
				...result,
				videoBuffer: {
					length: videoBuffer.length,
					type: format,
				},
			};

		case 'binary':
			const outputBinary = 'video';
			const outputFileName = `generated_video.${format}`;
			const fileSize = videoBuffer.length;

			return {
				json: result,
				binary: {
					[outputBinary]: {
						data: videoBuffer.toString('base64'),
						mimeType: `video/${format}`,
						fileName: outputFileName,
						fileSize: fileSize.toString(),
					},
				},
				pairedItem: {
					item: index,
				},
			};

		case 'file':
			const outputFilePath = executeFunctions.getNodeParameter('outputFilePath', index) as string;

			try {
				// Ensure directory exists
				const dir = path.dirname(outputFilePath);
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir, { recursive: true });
				}

				// Write file
				fs.writeFileSync(outputFilePath, videoBuffer);
				return {
					...result,
					filePath: outputFilePath,
				};
			} catch (fileError: any) {
				executeFunctions.logger.error('Failed to save video file', {
					filePath: outputFilePath,
					error: fileError.message
				});
				throw new Error(`Failed to save video file: ${fileError.message}`);
			}

		case 'json':
			// Return complete JSON with video data as base64
			return {
				...result,
				videoData: videoBuffer.toString('base64'),
				videoSize: videoBuffer.length,
			};

		default:
			return result;
	}
}

const GetVideoGeneration30ProResultOperate: ResourceOperations = {
	name: 'Video Generation 3.0 Pro Result',
	value: 'getVideoGeneration30ProResult',
	description: 'Get the result of a Video Generation 3.0 Pro task',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID returned from Video Generation 3.0 Pro submission',
			required: true,
		},
		{
			displayName: 'Output Format',
			name: 'outputFormat',
			type: 'options',
			options: [
				{ name: 'Base64 Encoded Video', value: 'base64' },
				{ name: 'Binary Data', value: 'binary' },
				{ name: 'Complete JSON', value: 'json' },
				{ name: 'URL Only', value: 'url' },
				{ name: 'Video Buffer Info', value: 'buffer' },
				{ name: 'Video File Path', value: 'file' },
			],
			default: 'url',
			description: 'How to return the generated video data',
		},
		{
			displayName: 'Video Format',
			name: 'videoFormat',
			type: 'options',
			options: [
				{ name: 'MP4', value: 'mp4' },
				{ name: 'WebM', value: 'webm' },
				{ name: 'AVI', value: 'avi' },
			],
			default: 'mp4',
			description: 'Video format for file output',
			displayOptions: {
				show: {
					outputFormat: ['binary', 'file'],
				},
			},
		},
		{
			displayName: 'Output File Path',
			name: 'outputFilePath',
			type: 'string',
			default: './generated_video.mp4',
			description: 'File path to save the generated video (only used when Output Format is "Video File Path")',
			displayOptions: {
				show: {
					outputFormat: ['file'],
				},
			},
		},
		{
			displayName: 'Enable Local Cache',
			name: 'enableCache',
			type: 'boolean',
			default: false,
			description: 'Whether to enable local video file caching based on task ID',
		},
		{
			displayName: 'Cache Directory',
			name: 'cacheDir',
			type: 'string',
			default: './cache/video',
			description: 'Directory to store cached video files',
			displayOptions: {
				show: {
					enableCache: [true],
				},
			},
		},
		{
			displayName: 'Additional Cache Parameters',
			name: 'cacheParams',
			type: 'collection',
			default: {},
			description: 'Additional parameters to include in cache key generation',
			displayOptions: {
				show: {
					enableCache: [true],
				},
			},
			options: [
				{
					displayName: 'Custom Cache Key',
					name: 'customKey',
					type: 'string',
					default: '',
					description: 'Custom string to include in cache key (optional)',
				},
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		// Get all required parameters
		const taskId = this.getNodeParameter('taskId', index) as string;
		const outputFormat = this.getNodeParameter('outputFormat', index) as string;
		const videoFormat = this.getNodeParameter('videoFormat', index) as string;
		const enableCache = this.getNodeParameter('enableCache', index) as boolean;
		const cacheDir = enableCache ? (this.getNodeParameter('cacheDir', index) as string) : './cache/video';
		const cacheParams = this.getNodeParameter('cacheParams', index, {}) as IDataObject;

		const credentials = await this.getCredentials('jimengCredentialsApi');

		if (!taskId || taskId.trim() === '') {
			throw new Error('Task ID is required and cannot be empty');
		}

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Generate MD5 for caching
		const additionalParams = {
			outputFormat,
			videoFormat,
			...(cacheParams.customKey && { customKey: cacheParams.customKey })
		};
		const md5Hash = generateMD5(taskId, additionalParams);

		// Check cache if enabled and not URL only format
		if (enableCache && outputFormat !== 'url') {
			ensureCacheDir(cacheDir);
			const cachedFilePath = getCachedFilePath(md5Hash, videoFormat, cacheDir);

			if (fs.existsSync(cachedFilePath)) {
				this.logger.info('Using cached video file', { filePath: cachedFilePath });

				const cachedVideoData = fs.readFileSync(cachedFilePath);
				const result: IDataObject = {
					taskId: taskId,
					status: 'completed',
					message: 'Video retrieved from cache',
					videoSize: cachedVideoData.length,
					cached: true,
					cacheFilePath: cachedFilePath,
				};

				return processVideoOutput(result, cachedVideoData, outputFormat, videoFormat, index, this);
			}
		}

		try {
			const data = await client.getVideoGeneration30ProResult(taskId);

			// Check if the response indicates an error
			if (data.code !== 10000) {
				throw new Error(`API request failed with code ${data.code}: ${data.message || 'Unknown error'}`);
			}

			// Check task status
			const status = data.data?.status;
			if (status === 'not_found') {
				throw new Error(`Task not found: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours). Please check the task ID and try again.`);
			}

			if (status === 'expired') {
				throw new Error(`Task has expired: ${taskId}. Please resubmit the task request.`);
			}

			// If task is not completed yet, return status without video data
			if (status !== 'completed' && status !== 'success') {
				return {
					taskId: taskId,
					status: status || 'unknown',
					message: data.message,
					requestId: data.request_id,
					code: data.code,
					videoUrl: data.data?.video_url,
				};
			}

			const videoUrl = data.data?.video_url;
			if (!videoUrl) {
				throw new Error('Video URL not found in the response. The task may not be completed yet.');
			}

			// If URL only format, return without downloading
			if (outputFormat === 'url') {
				return {
					taskId: taskId,
					status: status || 'completed',
					videoUrl: videoUrl,
					message: data.message,
					requestId: data.request_id,
					code: data.code,
				};
			}

			// Download video from URL
			this.logger.info('Downloading video from URL', { videoUrl });
			const videoBuffer = await downloadVideo(videoUrl);

			// Save to cache if enabled
			if (enableCache && videoBuffer.length > 0) {
				ensureCacheDir(cacheDir);
				const cachedFilePath = getCachedFilePath(md5Hash, videoFormat, cacheDir);
				fs.writeFileSync(cachedFilePath, videoBuffer);
				this.logger.info('Video saved to cache', { filePath: cachedFilePath });
			}

			const result: IDataObject = {
				taskId: taskId,
				status: status || 'completed',
				videoUrl: videoUrl,
				message: data.message,
				requestId: data.request_id,
				code: data.code,
				videoSize: videoBuffer.length,
				cached: false,
			};

			// Process output based on format
			return processVideoOutput(result, videoBuffer, outputFormat, videoFormat, index, this);

		} catch (error: any) {
			// Enhanced error handling with more context
			if (error.message.includes('Server internal error')) {
				throw new Error(`Video Generation 3.0 Pro result query failed: Server internal error for task ${taskId}. This may be due to: 1) The task is still being processed, 2) Server temporary issues. Please try again later. If the problem persists, contact support.`);
			}

			if (error.message.includes('Internal Error')) {
				throw new Error(`Video Generation 3.0 Pro result query failed: Internal server error for task ${taskId}. The server encountered an unexpected condition. Please try again later.`);
			}

			if (error.message.includes('Task not found')) {
				throw new Error(`Video Generation 3.0 Pro result query failed: Task not found - ${taskId}. Please verify the task ID is correct and hasn't expired (tasks expire after 12 hours).`);
			}

			if (error.message.includes('Task has expired')) {
				throw new Error(`Video Generation 3.0 Pro result query failed: Task has expired - ${taskId}. Please resubmit the video generation task.`);
			}

			// Re-throw the original error if it's not one of the handled cases
			throw error;
		}
	},
};

export default GetVideoGeneration30ProResultOperate;
