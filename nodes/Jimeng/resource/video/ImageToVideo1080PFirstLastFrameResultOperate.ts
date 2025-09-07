import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetImageToVideo1080PFirstLastFrameResultOperate: ResourceOperations = {
	name: 'Image to Video 1080P First Last Frame Result',
	value: 'getImageToVideo1080PFirstLastFrameResult',
	description: 'Get the result of 1080P image to video first last frame generation task',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID of the 1080P image to video first last frame generation task',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const taskId = this.getNodeParameter('taskId', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		try {
			const data = await client.getImageToVideo1080PFirstLastFrameResult(taskId);

			// Check task status
			if (data.data?.status === 'not_found') {
				throw new Error('Task not found, possible reasons: no such task or task has expired (12 hours)');
			}

			if (data.data?.status === 'expired') {
				throw new Error('Task has expired, please try resubmitting the task request');
			}

			return {
				taskId: taskId,
				status: data.data?.status || 'Unknown',
				videoUrl: data.data?.video_url,
				requestId: data.request_id,
				code: data.code,
				message: data.message,
				timeElapsed: data.time_elapsed,
			};
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to query task result: Internal error, please try again later. Task ID: ${taskId}`);
			}
			throw error;
		}
	},
};

export default GetImageToVideo1080PFirstLastFrameResultOperate;
