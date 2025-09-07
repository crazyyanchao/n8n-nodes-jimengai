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

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		const data = await client.getVideoGeneration30ProResult(taskId);

		return {
			taskId: taskId,
			status: data.data?.status || 'unknown',
			videoUrl: data.data?.video_url,
			message: data.message,
			requestId: data.request_id,
		};
	},
};

export default GetVideoGeneration30ProResultOperate;
