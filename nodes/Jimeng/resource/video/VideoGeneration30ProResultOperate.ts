import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

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
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const taskId = this.getNodeParameter('taskId', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		if (!taskId || taskId.trim() === '') {
			throw new Error('Task ID is required and cannot be empty');
		}

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

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

			return {
				taskId: taskId,
				status: status || 'unknown',
				videoUrl: data.data?.video_url,
				message: data.message,
				requestId: data.request_id,
				code: data.code,
			};
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
