import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ImageToVideo720PFirstFrameOperate: ResourceOperations = {
	name: 'Image to Video 720P First Frame',
	value: 'imageToVideo720PFirstFrame',
	description: 'Generate 720P video from image using first frame with Jimeng 3.0 model',
	options: [
		{
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			default: '',
			description: 'Text description for video generation',
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
			displayName: 'Aspect Ratio',
			name: 'aspect_ratio',
			type: 'options',
			default: '16:9',
			options: [
				{ name: '1:1', value: '1:1' },
				{ name: '16:9', value: '16:9' },
				{ name: '21:9', value: '21:9' },
				{ name: '3:4', value: '3:4' },
				{ name: '4:3', value: '4:3' },
				{ name: '9:16', value: '9:16' },
			],
			description: 'Video aspect ratio',
		},
		{
			displayName: 'Duration (Seconds)',
			name: 'duration',
			type: 'number',
			default: 5,
			typeOptions: {
				minValue: 1,
				maxValue: 10,
			},
			description: 'Video duration in seconds (1-10)',
		},
		{
			displayName: 'Seed',
			name: 'seed',
			type: 'number',
			default: -1,
			description: 'Random seed for generation (-1 for random)',
		},
		{
			displayName: 'Steps',
			name: 'steps',
			type: 'number',
			default: 20,
			typeOptions: {
				minValue: 1,
				maxValue: 50,
			},
			description: 'Number of denoising steps (1-50)',
		},
		{
			displayName: 'Guidance Scale',
			name: 'guidance_scale',
			type: 'number',
			default: 7.5,
			typeOptions: {
				minValue: 1,
				maxValue: 20,
			},
			description: 'Guidance scale for prompt adherence (1-20)',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const prompt = this.getNodeParameter('prompt', index) as string;
		let imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const aspectRatio = this.getNodeParameter('aspect_ratio', index) as string;
		const duration = this.getNodeParameter('duration', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const steps = this.getNodeParameter('steps', index) as number;
		const guidanceScale = this.getNodeParameter('guidance_scale', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		// Handle file upload if needed
		const linkType = checkLinkType(imageUrl);
		if (linkType === 'string') {
			const result = await buildUploadFileData.call(this, imageUrl);
			imageUrl = result.value;
		}

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		const data = await client.imageToVideo720PFirstFrame({
			prompt,
			image_url: imageUrl,
			aspect_ratio: aspectRatio,
			duration,
			seed: seed === -1 ? undefined : seed,
			steps,
			guidance_scale: guidanceScale,
			model: 'video-3.0-720p',
		});

		return {
			taskId: data.Result.TaskId,
			status: data.Result.Status,
			videos: data.Result.Videos || [],
			error: data.Result.Error,
			requestId: data.ResponseMetadata.RequestId,
		};
	},
};

export default ImageToVideo720PFirstFrameOperate;
