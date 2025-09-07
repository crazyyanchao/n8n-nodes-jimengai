import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const TextToImageOperate: ResourceOperations = {
	name: 'Text to Image',
	value: 'textToImage',
	description: 'Generate image from text prompt',
	options: [
		{
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			default: '',
			description: 'Text description for image generation',
			required: true,
		},
		{
			displayName: 'Model',
			name: 'model',
			type: 'string',
			default: 'jimeng-3.1',
			description: 'Image generation model to use. Available models: jimeng-1.4, jimeng-2.0, jimeng-2.0-pro, jimeng-2.1, jimeng-3.0, jimeng-3.1, jimeng-xl-pro. Default: jimeng-3.1 (strongest model)',
		},
		{
			displayName: 'Width',
			name: 'width',
			type: 'number',
			default: 1024,
			description: 'Image width. Common aspect ratios: 21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16.',
		},
		{
			displayName: 'Height',
			name: 'height',
			type: 'number',
			default: 1024,
			description: 'Image height. Common aspect ratios: 21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16.',
		},
		{
			displayName: 'Wait for Image Return',
			name: 'waitForReturn',
			type: 'boolean',
			required: true,
			default: true,
			description: 'Whether to wait for image generation to complete',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const prompt = this.getNodeParameter('prompt', index) as string;
		const model = this.getNodeParameter('model', index) as string;
		const width = this.getNodeParameter('width', index) as number;
		const height = this.getNodeParameter('height', index) as number;
		const waitForReturn = this.getNodeParameter('waitForReturn', index) as boolean;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({ refreshToken: String(credentials.sessionid) });
		const data = await client.generateImage(
			prompt,
			'',
			model,
			width,
			height,
			0.5,
			'',
			waitForReturn ? 0 : 1
		);

		const randomImg = Math.floor(Math.random() * (data.imageUrls?.length || 0)) + 1;

		return {
			list: data.imageUrls || [],
			status: data.status,
			historyId: data.historyId,
			failCode: data.failCode || '',
			randomImg: (data.imageUrls || [])[randomImg - 1] || '',
		};
	},
};

export default TextToImageOperate;
