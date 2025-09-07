import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetImageStatusOperate: ResourceOperations = {
	name: 'Get Image Status',
	value: 'getImageStatus',
	description: 'Get the status of image generation task',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID of the image generation task',
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

		const data = await client.getImageStatus(taskId);

		return {
			taskId: data.Result.TaskId,
			status: data.Result.Status,
			images: data.Result.Images || [],
			error: data.Result.Error,
			requestId: data.ResponseMetadata.RequestId,
		};
	},
};

export default GetImageStatusOperate;
