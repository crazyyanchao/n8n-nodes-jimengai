import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../../help/type/IResource';
import { JimengApiClient } from '../../../utils/JimengApiClient';

const HumanSubjectDetectionResultOperate: ResourceOperations = {
	name: 'Human Subject Detection Result',
	value: 'getHumanSubjectDetectionResult',
	description: 'Get the result of a human subject detection task',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID returned from human subject detection submission',
			required: true,
		},
		{
			displayName: 'Output Format',
			name: 'outputFormat',
			type: 'options',
			options: [
				{ name: 'Detection Status Only', value: 'status' },
				{ name: 'Complete JSON', value: 'json' },
				{ name: 'Detailed Result', value: 'detailed' },
			],
			default: 'detailed',
			description: 'How to return the detection result data',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		// Get all required parameters
		const taskId = this.getNodeParameter('taskId', index) as string;
		const outputFormat = this.getNodeParameter('outputFormat', index) as string;

		const credentials = await this.getCredentials('jimengCredentialsApi');

		if (!taskId || taskId.trim() === '') {
			throw new Error('Task ID is required and cannot be empty');
		}

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		this.logger.info('Starting human subject detection result processing', {
			taskId: taskId,
			outputFormat: outputFormat,
		});

		try {
			this.logger.info('Calling API to get human subject detection result', { taskId });
			const data = await client.getHumanSubjectDetectionResult(taskId);

			this.logger.info('API response received', {
				code: data.code,
				status: data.data?.status,
				message: data.message,
				hasRespData: !!(data.data?.resp_data)
			});

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

			// If task is not completed yet, return status without result data
			const isCompleted = status === 'done';

			if (!isCompleted) {
				this.logger.info('Task not completed yet, returning status', {
					status,
					code: data.code,
					outputFormat
				});
				return {
					taskId: taskId,
					status: status || 'unknown',
					message: data.message,
					requestId: data.requestId || data.request_id,
					code: data.code,
				};
			}

			// Parse the resp_data JSON string
			let detectionResult: any = null;
			if (data.data?.resp_data) {
				try {
					detectionResult = JSON.parse(data.data.resp_data);
				} catch (parseError) {
					this.logger.warn('Failed to parse resp_data JSON', {
						respData: data.data.resp_data,
						error: parseError
					});
				}
			}

			this.logger.info('Task completed, processing detection result', {
				status: status,
				detectionResult: detectionResult,
				outputFormat: outputFormat
			});

			// Process output based on format
			const result: IDataObject = {
				taskId: taskId,
				status: status || 'completed',
				message: data.message,
				requestId: data.requestId || data.request_id,
				code: data.code,
			};

			// Add detection result based on output format
			if (detectionResult) {
				switch (outputFormat) {
					case 'status':
						// Return only the detection status (0 or 1)
						return {
							...result,
							hasHumanSubject: detectionResult.status === 1,
							detectionStatus: detectionResult.status,
							statusText: detectionResult.status === 1 ? 'Contains human subjects' : 'No human subjects detected',
						};

					case 'json':
						// Return complete JSON with raw resp_data
						return {
							...result,
							rawRespData: data.data.resp_data,
							detectionResult: detectionResult,
						};

					case 'detailed':
					default:
						// Return detailed result with parsed data
						return {
							...result,
							hasHumanSubject: detectionResult.status === 1,
							detectionStatus: detectionResult.status,
							statusText: detectionResult.status === 1 ? 'Contains human subjects' : 'No human subjects detected',
							rawRespData: data.data.resp_data,
							detectionResult: detectionResult,
							analysis: {
								containsHuman: detectionResult.status === 1,
								containsHumanoid: detectionResult.status === 1,
								containsAvatar: detectionResult.status === 1,
								confidence: 'High', // The API returns binary result (0 or 1)
							}
						};
				}
			} else {
				// If no resp_data, return basic result
				return {
					...result,
					message: 'Task completed but no detection result available',
					hasHumanSubject: false,
					detectionStatus: null,
				};
			}

		} catch (error: any) {
			// Enhanced error handling with more context
			if (error.message.includes('Server internal error')) {
				throw new Error(`Human subject detection result query failed: Server internal error for task ${taskId}. This may be due to: 1) The task is still being processed, 2) Server temporary issues. Please try again later. If the problem persists, contact support.`);
			}

			if (error.message.includes('Internal Error')) {
				throw new Error(`Human subject detection result query failed: Internal server error for task ${taskId}. The server encountered an unexpected condition. Please try again later.`);
			}

			if (error.message.includes('Task not found')) {
				throw new Error(`Human subject detection result query failed: Task not found - ${taskId}. Please verify the task ID is correct and hasn't expired (tasks expire after 12 hours).`);
			}

			if (error.message.includes('Task has expired')) {
				throw new Error(`Human subject detection result query failed: Task has expired - ${taskId}. Please resubmit the human subject detection task.`);
			}

			// Re-throw the original error if it's not one of the handled cases
			throw error;
		}
	},
};

export default HumanSubjectDetectionResultOperate;
