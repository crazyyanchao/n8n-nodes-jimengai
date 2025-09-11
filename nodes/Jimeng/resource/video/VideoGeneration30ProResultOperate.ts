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
function getCachedFilePath(cacheKey: string, format: string, cacheDir: string): string {
	return path.join(cacheDir, `${cacheKey}.${format}`);
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
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
			}
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
	executeFunctions.logger.info('Processing video output', {
		outputFormat: outputFormat,
		format: format,
		videoSize: videoBuffer.length,
		index: index
	});

	switch (outputFormat) {
		case 'base64':
			executeFunctions.logger.info('Processing base64 output format');
			return {
				...result,
				videoData: videoBuffer.toString('base64'),
			};

		case 'buffer':
			executeFunctions.logger.info('Processing buffer output format');
			return {
				...result,
				videoBuffer: {
					length: videoBuffer.length,
					type: format,
				},
			};

		case 'binary':
			executeFunctions.logger.info('Processing binary output format');
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
			executeFunctions.logger.info('Processing file output format');
			const outputFilePath = executeFunctions.getNodeParameter('outputFilePath', index) as string;

			executeFunctions.logger.info('Starting file output process', {
				originalPath: outputFilePath,
				videoSize: videoBuffer.length,
				format: format
			});

			try {
				// Convert to absolute path if it's relative
				const absoluteFilePath = path.isAbsolute(outputFilePath)
					? outputFilePath
					: path.resolve(process.cwd(), outputFilePath);

				executeFunctions.logger.info('Path resolution completed', {
					originalPath: outputFilePath,
					absolutePath: absoluteFilePath,
					isAbsolute: path.isAbsolute(outputFilePath),
					workingDirectory: process.cwd()
				});

				// Ensure directory exists
				const dir = path.dirname(absoluteFilePath);
				if (!fs.existsSync(dir)) {
					executeFunctions.logger.info('Creating directory', { directory: dir });
					fs.mkdirSync(dir, { recursive: true });
					executeFunctions.logger.info('Directory created successfully', { directory: dir });
				} else {
					executeFunctions.logger.info('Directory already exists', { directory: dir });
				}

				// Write file
				executeFunctions.logger.info('Writing video file', {
					filePath: absoluteFilePath,
					fileSize: videoBuffer.length
				});

				fs.writeFileSync(absoluteFilePath, videoBuffer);

				// Verify file was written
				const stats = fs.statSync(absoluteFilePath);
				executeFunctions.logger.info('Video file saved successfully', {
					filePath: absoluteFilePath,
					fileSize: videoBuffer.length,
					actualFileSize: stats.size,
					fileExists: fs.existsSync(absoluteFilePath)
				});

				return {
					...result,
					filePath: absoluteFilePath,
					fileSize: videoBuffer.length,
					message: `Video saved to: ${absoluteFilePath}`,
				};
			} catch (fileError: any) {
				executeFunctions.logger.error('Failed to save video file', {
					originalPath: outputFilePath,
					error: fileError.message,
					stack: fileError.stack,
					videoSize: videoBuffer.length
				});
				throw new Error(`Failed to save video file: ${fileError.message}`);
			}

		case 'json':
			executeFunctions.logger.info('Processing json output format');
			// Return complete JSON with video data as base64
			return {
				...result,
				videoData: videoBuffer.toString('base64'),
				videoSize: videoBuffer.length,
			};

		default:
			executeFunctions.logger.info('Processing default output format', { outputFormat });
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
			default: './output/video.mp4',
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
			description: 'Directory to store cached video files (relative to n8n working directory)',
			displayOptions: {
				show: {
					enableCache: [true],
				},
			},
		},
		{
			displayName: 'Cache Key Settings',
			name: 'cacheKeySettings',
			type: 'collection',
			default: {},
			description: 'Settings for cache key generation',
			displayOptions: {
				show: {
					enableCache: [true],
				},
			},
			options: [
				{
					displayName: 'Cache Key Mode',
					name: 'cacheKeyMode',
					type: 'options',
					options: [
						{
							name: 'Auto Generate (Task ID + Parameters)',
							value: 'auto',
							description: 'Automatically generate cache key based on task ID and parameters',
						},
						{
							name: 'Custom String',
							value: 'custom',
							description: 'Use a custom string as cache key',
						},
					],
					default: 'auto',
					description: 'How to generate the cache key',
				},
				{
					displayName: 'Custom Cache Key',
					name: 'customCacheKey',
					type: 'string',
					default: '',
					description: 'Custom string to use as cache key (only used when Cache Key Mode is "Custom String")',
					displayOptions: {
						show: {
							cacheKeyMode: ['custom'],
						},
					},
				},
				{
					displayName: 'Calculate MD5 Hash',
					name: 'calculateMD5',
					type: 'boolean',
					default: true,
					description: 'Whether to calculate MD5 hash of the custom cache key (only used when Cache Key Mode is "Custom String")',
					displayOptions: {
						show: {
							cacheKeyMode: ['custom'],
						},
					},
				},
				{
					displayName: 'Additional Parameters',
					name: 'additionalParams',
					type: 'string',
					default: '',
					description: 'Additional parameters to include in auto-generated cache key (optional)',
					displayOptions: {
						show: {
							cacheKeyMode: ['auto'],
						},
					},
				},
			],
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		// Get all required parameters
		const taskId = this.getNodeParameter('taskId', index) as string;
		const outputFormat = this.getNodeParameter('outputFormat', index) as string;
		const enableCache = this.getNodeParameter('enableCache', index) as boolean;
		const cacheKeySettings = this.getNodeParameter('cacheKeySettings', index, {}) as IDataObject;

		// Only get videoFormat when outputFormat is 'binary' or 'file'
		let videoFormat: string = 'mp4'; // default value
		if (outputFormat === 'binary' || outputFormat === 'file') {
			videoFormat = this.getNodeParameter('videoFormat', index) as string;
		}

		// Only get cacheDir when enableCache is true
		const cacheDir = enableCache ? (this.getNodeParameter('cacheDir', index) as string) : './cache/video';


		const credentials = await this.getCredentials('jimengCredentialsApi');

		if (!taskId || taskId.trim() === '') {
			throw new Error('Task ID is required and cannot be empty');
		}

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Generate cache key based on settings
		let cacheKey: string;
		const cacheKeyMode = cacheKeySettings.cacheKeyMode || 'auto';

		if (cacheKeyMode === 'custom') {
			const customCacheKey = cacheKeySettings.customCacheKey as string;
			if (!customCacheKey || customCacheKey.trim() === '') {
				throw new Error('Custom cache key is required when Cache Key Mode is set to "Custom String"');
			}

			const calculateMD5 = cacheKeySettings.calculateMD5 !== false; // Default to true
			if (calculateMD5) {
				cacheKey = crypto.createHash('md5').update(customCacheKey).digest('hex');
				this.logger.info('Generated cache key from custom string with MD5', {
					customKey: customCacheKey,
					cacheKey: cacheKey
				});
			} else {
				cacheKey = customCacheKey;
				this.logger.info('Using custom cache key directly', {
					cacheKey: cacheKey
				});
			}
		} else {
			// Auto mode - generate based on task ID and parameters
			const additionalParams = {
				outputFormat,
				videoFormat,
				...(cacheKeySettings.additionalParams && { additionalParams: cacheKeySettings.additionalParams })
			};
			cacheKey = generateMD5(taskId, additionalParams);
			this.logger.info('Generated cache key automatically', {
				taskId: taskId,
				additionalParams: additionalParams,
				cacheKey: cacheKey
			});
		}

		this.logger.info('Starting video generation result processing', {
			taskId: taskId,
			outputFormat: outputFormat,
			enableCache: enableCache,
			videoFormat: videoFormat
		});

		// Check cache if enabled and not URL only format
		if (enableCache && outputFormat !== 'url') {
			this.logger.info('Checking cache for video file', { enableCache, outputFormat });
			// Convert cache directory to absolute path
			const absoluteCacheDir = path.isAbsolute(cacheDir)
				? cacheDir
				: path.resolve(process.cwd(), cacheDir);

			ensureCacheDir(absoluteCacheDir);
			const cachedFilePath = getCachedFilePath(cacheKey, videoFormat, absoluteCacheDir);

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
			} else {
				this.logger.info('No cached file found, proceeding with API call', { cachedFilePath });
			}
		} else {
			this.logger.info('Cache disabled or URL format, proceeding with API call', { enableCache, outputFormat });
		}

		try {
			this.logger.info('Calling API to get video generation result', { taskId });
			const data = await client.getVideoGeneration30ProResult(taskId);

			this.logger.info('API response received', {
				code: data.code,
				status: data.status,
				message: data.message,
				hasVideoUrl: !!(data.videoUrl || data.data?.video_url)
			});

			// Check if the response indicates an error
			if (data.code !== 10000) {
				throw new Error(`API request failed with code ${data.code}: ${data.message || 'Unknown error'}`);
			}

			// Check task status - handle both direct status and nested data.status
			const status = data.status || data.data?.status;
			if (status === 'not_found') {
				throw new Error(`Task not found: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours). Please check the task ID and try again.`);
			}

			if (status === 'expired') {
				throw new Error(`Task has expired: ${taskId}. Please resubmit the task request.`);
			}

			// If task is not completed yet, return status without video data
			if (status !== 'completed' && status !== 'success' && status !== 'done') {
				this.logger.info('Task not completed yet, returning status', { status, outputFormat });
				return {
					taskId: taskId,
					status: status || 'unknown',
					message: data.message,
					requestId: data.requestId || data.request_id,
					code: data.code,
					videoUrl: data.videoUrl || data.data?.video_url,
				};
			}

			// Handle both direct videoUrl and nested data.video_url
			const videoUrl = data.videoUrl || data.data?.video_url;
			if (!videoUrl) {
				throw new Error('Video URL not found in the response. The task may not be completed yet.');
			}

			this.logger.info('Task completed, processing video output', {
				videoUrl: videoUrl,
				outputFormat: outputFormat,
				videoFormat: videoFormat
			});

			// If URL only format, return without downloading
			if (outputFormat === 'url') {
				this.logger.info('Returning URL only format');
				return {
					taskId: taskId,
					status: status || 'completed',
					videoUrl: videoUrl,
					message: data.message,
					requestId: data.requestId || data.request_id,
					code: data.code,
				};
			}

			// Download video from URL
			this.logger.info('Downloading video from URL', { videoUrl });
			const videoBuffer = await downloadVideo(videoUrl);

			this.logger.info('Video downloaded successfully', {
				videoSize: videoBuffer.length,
				outputFormat: outputFormat,
				videoFormat: videoFormat
			});

			// Save to cache if enabled
			if (enableCache && videoBuffer.length > 0) {
				this.logger.info('Saving video to cache', { enableCache, videoSize: videoBuffer.length });
				// Convert cache directory to absolute path
				const absoluteCacheDir = path.isAbsolute(cacheDir)
					? cacheDir
					: path.resolve(process.cwd(), cacheDir);

				ensureCacheDir(absoluteCacheDir);
				const cachedFilePath = getCachedFilePath(cacheKey, videoFormat, absoluteCacheDir);
				fs.writeFileSync(cachedFilePath, videoBuffer);
				this.logger.info('Video saved to cache', {
					filePath: cachedFilePath,
					fileSize: videoBuffer.length,
					cacheDir: absoluteCacheDir
				});
			} else {
				this.logger.info('Skipping cache save', { enableCache, videoSize: videoBuffer.length });
			}

			const result: IDataObject = {
				taskId: taskId,
				status: status || 'completed',
				videoUrl: videoUrl,
				message: data.message,
				requestId: data.requestId || data.request_id,
				code: data.code,
				videoSize: videoBuffer.length,
				cached: false,
			};

			this.logger.info('Processing video output with format', {
				outputFormat: outputFormat,
				videoFormat: videoFormat,
				videoSize: videoBuffer.length
			});

			// Process output based on format
			const processedResult = processVideoOutput(result, videoBuffer, outputFormat, videoFormat, index, this);

			this.logger.info('Video output processing completed', {
				outputFormat: outputFormat,
				resultKeys: Object.keys(processedResult)
			});

			return processedResult;

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
