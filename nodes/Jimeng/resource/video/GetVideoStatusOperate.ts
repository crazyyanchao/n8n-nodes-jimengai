import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetVideoStatusOperate: ResourceOperations = {
	name: 'Get Video Status',
	value: 'getVideoStatus',
	description: 'Get the status of video generation',
	options: [
		{
			displayName: 'History ID',
			name: 'historyId',
			type: 'string',
			default: '',
			description: 'History ID of the video generation task',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const historyId = this.getNodeParameter('historyId', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({ refreshToken: String(credentials.sessionid) });
		const data = await client.getVideoStatus(historyId);

		return {
			list: data.videoInfoList || [],
			status: data.status,
			historyId: data.historyId,
			failCode: data.failCode || '',
		};
	},
};

export default GetVideoStatusOperate;
