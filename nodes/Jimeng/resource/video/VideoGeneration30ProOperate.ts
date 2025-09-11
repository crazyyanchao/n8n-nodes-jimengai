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
			displayName: 'Frames',
			name: 'frames',
			type: 'options',
			default: 121,
			options: [
				{ name: '5 Seconds (121 Frames)', value: 121 },
				{ name: '10 Seconds (241 Frames)', value: 241 },
			],
			description: 'Total number of frames (121 for 5s, 241 for 10s)',
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
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const aspectRatio = this.getNodeParameter('aspect_ratio', index) as string;
		const frames = this.getNodeParameter('frames', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Submit task
		const submitData = await client.submitVideoGeneration30ProTask({
			prompt,
			image_urls: imageUrl ? [imageUrl] : undefined,
			aspect_ratio: aspectRatio,
			frames,
			seed: seed === -1 ? undefined : seed,
		});

		return {
			taskId: submitData.task_id,
			status: 'submitted',
			message: submitData.message,
			prompt: prompt,
			imageUrl: imageUrl
		};
	},
};

export default VideoGeneration30ProOperate;
