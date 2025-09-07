import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetImageToVideo1080PFirstFrameResultOperate: ResourceOperations = {
	name: 'Image to Video 1080P First Frame Result',
	value: 'getImageToVideo1080PFirstFrameResult',
	description: 'Get the result of 1080P image to video first frame generation task',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID returned from the image to video 1080P first frame generation',
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

		const data = await client.getImageToVideo1080PFirstFrameResult(taskId);

		return {
			taskId: data.data?.task_id,
			status: data.data?.status,
			videoUrl: data.data?.video_url,
			error: data.message,
			requestId: data.request_id,
		};
	},
};

export default GetImageToVideo1080PFirstFrameResultOperate;
