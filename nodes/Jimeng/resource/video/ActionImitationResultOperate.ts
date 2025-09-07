import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetActionImitationResultOperate: ResourceOperations = {
	name: 'Action Imitation Result',
	value: 'getActionImitationResult',
	description: 'Get the result of action imitation task using Jimeng AI',
	options: [
		{
			displayName: 'Task ID',
			name: 'taskId',
			type: 'string',
			default: '',
			description: 'Task ID returned from action imitation submission',
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

		const result = await client.getActionImitationResult(taskId);

		return {
			code: result.code,
			message: result.message,
			requestId: result.request_id,
			status: result.status,
			timeElapsed: result.time_elapsed,
			taskId: result.data?.task_id,
			taskStatus: result.data?.status,
			videoUrl: result.data?.video_url,
		};
	},
};

export default GetActionImitationResultOperate;
