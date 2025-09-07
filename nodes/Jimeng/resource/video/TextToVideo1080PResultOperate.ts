import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetTextToVideo1080PResultOperate: ResourceOperations = {
	name: 'Text to Video 1080P Result',
	value: 'getTextToVideo1080PResult',
	description: 'Get the result of a Text to Video 1080P generation task',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID returned from Text to Video 1080P submission',
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
			const data = await client.getTextToVideo1080PResult(taskId);

			// Check task status
			if (data.data?.status === 'not_found') {
				throw new Error('Task not found, possible reasons: no such task or task has expired (12 hours)');
			}

			if (data.data?.status === 'expired') {
				throw new Error('Task has expired, please try resubmitting the task request');
			}

			// AsyncVideoResponse format
			return {
				taskId: data.data?.task_id || taskId,
				status: data.data?.status,
				videoUrl: data.data?.video_url,
				error: data.message,
				requestId: data.request_id,
				// Add Text to Video 1080P specific information
				modelType: 'Text to Video 1080P',
				resolution: '1080P',
				generationType: 'Text-to-Video',
			};
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to query Text to Video 1080P task result: Internal error, please try again later. Task ID: ${taskId}`);
			}
			throw error;
		}
	},
};

export default GetTextToVideo1080PResultOperate;
