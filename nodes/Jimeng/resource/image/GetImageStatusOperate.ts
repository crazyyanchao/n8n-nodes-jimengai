import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const GetImageStatusOperate: ResourceOperations = {
	name: 'Get Image Status',
	value: 'getImageStatus',
	description: 'Get the status of image generation',
	options: [
		{
			displayName: 'History ID',
			name: 'historyId',
			type: 'string',
			default: '',
			description: 'History ID of the image generation task',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const historyId = this.getNodeParameter('historyId', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({ refreshToken: String(credentials.sessionid) });
		const data = await client.getImageStatus(historyId);

		return {
			list: data.imageUrls || [],
			status: data.status,
			historyId: data.historyId,
			failCode: data.failCode || '',
		};
	},
};

export default GetImageStatusOperate;
