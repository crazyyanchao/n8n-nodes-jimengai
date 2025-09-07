import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const TextToVideo1080POperate: ResourceOperations = {
	name: 'Text to Video 1080P',
	value: 'textToVideo1080P',
	description: 'Generate 1080P video from text prompt using Jimeng 3.0 model',
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
			required: true,
		},
		{
			displayName: 'Duration (Seconds)',
			name: 'duration',
			type: 'options',
			default: 5,
			options: [
				{ name: '5 Seconds', value: 5 },
				{ name: '10 Seconds', value: 10 },
			],
			description: 'Video duration in seconds (5s or 10s)',
			required: true,
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
		const aspectRatio = this.getNodeParameter('aspect_ratio', index) as string;
		const duration = this.getNodeParameter('duration', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Convert duration to frames: 5s = 121 frames, 10s = 241 frames
		const frames = duration === 5 ? 121 : 241;

		const data = await client.textToVideo1080P({
			prompt,
			aspect_ratio: aspectRatio,
			frames,
			seed: seed === -1 ? -1 : seed,
		});

		return {
			taskId: data.data.task_id,
			status: data.data.status,
			videoUrl: data.data.video_url,
			error: data.message,
			requestId: data.request_id,
		};
	},
};

export default TextToVideo1080POperate;
