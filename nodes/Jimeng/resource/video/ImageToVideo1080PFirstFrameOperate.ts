import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ImageToVideo1080PFirstFrameOperate: ResourceOperations = {
	name: 'Image to Video 1080P First Frame',
	value: 'imageToVideo1080PFirstFrame',
	description: 'Generate 1080P video from image using first frame with Jimeng 3.0 model',
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
			default: 'url',
			options: [
				{ name: 'Image URL', value: 'url' },
				{ name: 'Base64 Data', value: 'base64' },
			],
			description: 'Choose how to provide the image',
		},
		{
			displayName: 'Image URL',
			name: 'imageUrl',
			type: 'string',
			default: '',
			description: 'URL or path to the input image (JPEG/PNG format, max 4.7MB, max 4096x4096)',
			displayOptions: {
				show: {
					imageInputType: ['url'],
				},
			},
			required: true,
		},
		{
			displayName: 'Image Base64',
			name: 'imageBase64',
			type: 'string',
			default: '',
			description: 'Base64 encoded image data (JPEG/PNG format, max 4.7MB, max 4096x4096)',
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
			description: 'Total number of frames to generate (121 for 5s, 241 for 10s)',
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

		if (imageInputType === 'url') {
			let imageUrl = this.getNodeParameter('imageUrl', index) as string;

			// Handle file upload if needed
			const linkType = checkLinkType(imageUrl);
			if (linkType === 'string') {
				const result = await buildUploadFileData.call(this, imageUrl);
				imageUrl = result.value;
			}

			requestData.image_urls = [imageUrl];
		} else {
			const imageBase64 = this.getNodeParameter('imageBase64', index) as string;
			requestData.binary_data_base64 = [imageBase64];
		}

		const data = await client.imageToVideo1080PFirstFrame(requestData);

		return {
			taskId: data.data?.task_id,
			status: data.data?.status,
			videoUrl: data.data?.video_url,
			error: data.message,
			requestId: data.request_id,
		};
	},
};

export default ImageToVideo1080PFirstFrameOperate;
