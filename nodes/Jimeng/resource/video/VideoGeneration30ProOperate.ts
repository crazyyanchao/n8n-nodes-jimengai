import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const VideoGeneration30ProOperate: ResourceOperations = {
	name: 'Video Generation 3.0 Pro',
	value: 'videoGeneration30Pro',
	description: 'Generate high-quality video using Jimeng 3.0 Pro model',
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
			description: 'URL or path to the input image (optional)',
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
			displayName: 'Width',
			name: 'width',
			type: 'number',
			default: 1920,
			description: 'Video width (Pro model supports custom resolution)',
		},
		{
			displayName: 'Height',
			name: 'height',
			type: 'number',
			default: 1080,
			description: 'Video height (Pro model supports custom resolution)',
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
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const aspectRatio = this.getNodeParameter('aspect_ratio', index) as string;
		const duration = this.getNodeParameter('duration', index) as number;
		const width = this.getNodeParameter('width', index) as number;
		const height = this.getNodeParameter('height', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const steps = this.getNodeParameter('steps', index) as number;
		const guidanceScale = this.getNodeParameter('guidance_scale', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		const data = await client.videoGeneration30Pro({
			prompt,
			image_url: imageUrl || undefined,
			aspect_ratio: aspectRatio,
			duration,
			width,
			height,
			seed: seed === -1 ? undefined : seed,
			steps,
			guidance_scale: guidanceScale,
			model: 'video-3.0-pro',
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

export default VideoGeneration30ProOperate;
