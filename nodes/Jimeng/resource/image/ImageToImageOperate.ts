import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ImageToImageOperate: ResourceOperations = {
	name: 'Image to Image',
	value: 'image:imageToImage',
	description: 'Generate image from image and text prompt',
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
			displayName: 'Image URL',
			name: 'imageUrl',
			type: 'string',
			default: '',
			description: 'URL or path to the input image',
			required: true,
		},
		{
			displayName: 'Model',
			name: 'model',
			type: 'string',
			default: 'jimeng-3.0',
			description: 'Image generation model to use. Available models: jimeng-3.0, jimeng-2.0-pro. Default: jimeng-3.0 (strongest model)',
		},
		{
			displayName: 'Custom Width/Height',
			name: 'customWH',
			type: 'boolean',
			default: false,
			description: 'Whether to use custom width and height instead of image dimensions',
		},
		{
			displayName: 'Width',
			name: 'width',
			type: 'number',
			default: 1024,
			displayOptions: {
				show: {
					customWH: [true],
				},
			},
			description: 'Image width. Common aspect ratios: 21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16.',
		},
		{
			displayName: 'Height',
			name: 'height',
			type: 'number',
			default: 1024,
			displayOptions: {
				show: {
					customWH: [true],
				},
			},
			description: 'Image height. Common aspect ratios: 21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16.',
		},
		{
			displayName: 'Reference Strength',
			name: 'sampleStrength',
			type: 'number',
			required: true,
			default: 50,
			typeOptions: {
				minValue: 0,
				maxValue: 100,
			},
			description: 'Strength of reference to original image (0-100)',
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
		const sampleStrength = this.getNodeParameter('sampleStrength', index) as number;
		let imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const waitForReturn = this.getNodeParameter('waitForReturn', index) as boolean;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		let width = 0;
		let height = 0;
		if (this.getNodeParameter('customWH', index)) {
			width = this.getNodeParameter('width', index) as number;
			height = this.getNodeParameter('height', index) as number;
		}

		// Handle file upload if needed
		const linkType = checkLinkType(imageUrl);
		if (linkType === 'string') {
			const result = await buildUploadFileData.call(this, imageUrl);
			imageUrl = result.value;
		}

		const client = new JimengApiClient({ refreshToken: String(credentials.sessionid) });
		const data = await client.generateImage(
			prompt,
			imageUrl,
			model,
			width,
			height,
			sampleStrength / 100,
			'',
			waitForReturn ? 0 : 1
		);

		return {
			list: data.imageUrls || [],
			status: data.status,
			historyId: data.historyId,
			failCode: data.failCode || '',
		};
	},
};

export default ImageToImageOperate;
