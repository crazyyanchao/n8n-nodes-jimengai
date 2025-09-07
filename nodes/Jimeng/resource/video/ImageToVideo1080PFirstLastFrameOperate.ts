import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ImageToVideo1080PFirstLastFrameOperate: ResourceOperations = {
	name: 'Image to Video 1080P First Last Frame',
	value: 'imageToVideo1080PFirstLastFrame',
	description: 'Generate 1080P video from image using first and last frames with Jimeng 3.0 model',
	options: [
		{
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			default: '',
			description: 'Text description for video generation (max 800 characters)',
			required: true,
		},
		{
			displayName: 'Image Input Type',
			name: 'imageInputType',
			type: 'options',
			default: 'urls',
			options: [
				{ name: 'Image URLs', value: 'urls' },
				{ name: 'Base64 Data', value: 'base64' },
			],
			description: 'Choose how to provide images',
		},
		{
			displayName: 'First Frame Image URL',
			name: 'firstFrameUrl',
			type: 'string',
			default: '',
			description: 'URL to the first frame image',
			displayOptions: {
				show: {
					imageInputType: ['urls'],
				},
			},
			required: true,
		},
		{
			displayName: 'Last Frame Image URL',
			name: 'lastFrameUrl',
			type: 'string',
			default: '',
			description: 'URL to the last frame image',
			displayOptions: {
				show: {
					imageInputType: ['urls'],
				},
			},
			required: true,
		},
		{
			displayName: 'First Frame Base64',
			name: 'firstFrameBase64',
			type: 'string',
			default: '',
			description: 'Base64 encoded first frame image data',
			displayOptions: {
				show: {
					imageInputType: ['base64'],
				},
			},
			required: true,
		},
		{
			displayName: 'Last Frame Base64',
			name: 'lastFrameBase64',
			type: 'string',
			default: '',
			description: 'Base64 encoded last frame image data',
			displayOptions: {
				show: {
					imageInputType: ['base64'],
				},
			},
			required: true,
		},
		{
			displayName: 'Frames',
			name: 'frames',
			type: 'options',
			default: 121,
			options: [
				{ name: '5 Seconds (121 Frames)', value: 121 },
				{ name: '10 Seconds (241 Frames)', value: 241 },
			],
			description: 'Total number of frames to generate',
		},
		{
			displayName: 'Seed',
			name: 'seed',
			type: 'number',
			default: -1,
			description: 'Random seed for generation (-1 for random)',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const prompt = this.getNodeParameter('prompt', index) as string;
		const imageInputType = this.getNodeParameter('imageInputType', index) as string;
		const frames = this.getNodeParameter('frames', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		let requestData: any = {
			prompt,
			seed: seed === -1 ? -1 : seed,
			frames,
		};

		if (imageInputType === 'urls') {
			let firstFrameUrl = this.getNodeParameter('firstFrameUrl', index) as string;
			let lastFrameUrl = this.getNodeParameter('lastFrameUrl', index) as string;

			// Handle file upload if needed
			const firstFrameLinkType = checkLinkType(firstFrameUrl);
			if (firstFrameLinkType === 'string') {
				const result = await buildUploadFileData.call(this, firstFrameUrl);
				firstFrameUrl = result.value;
			}

			const lastFrameLinkType = checkLinkType(lastFrameUrl);
			if (lastFrameLinkType === 'string') {
				const result = await buildUploadFileData.call(this, lastFrameUrl);
				lastFrameUrl = result.value;
			}

			requestData.image_urls = [firstFrameUrl, lastFrameUrl];
		} else {
			const firstFrameBase64 = this.getNodeParameter('firstFrameBase64', index) as string;
			const lastFrameBase64 = this.getNodeParameter('lastFrameBase64', index) as string;
			requestData.binary_data_base64 = [firstFrameBase64, lastFrameBase64];
		}

		const data = await client.imageToVideo1080PFirstLastFrame(requestData);

		return {
			taskId: data.data?.task_id,
			status: data.data?.status,
			error: data.message,
			requestId: data.request_id,
		};
	},
};

export default ImageToVideo1080PFirstLastFrameOperate;
