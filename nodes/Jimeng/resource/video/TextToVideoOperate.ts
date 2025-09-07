import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const TextToVideoOperate: ResourceOperations = {
	name: 'Text to Video',
	value: 'textToVideo',
	description: 'Generate video from text prompt',
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
			displayName: 'Model',
			name: 'model',
			type: 'string',
			default: 'video-S3.0-pro',
			description: 'Video generation model to use. Available models: video-S2.0, video-S2.0-Pro, video-S3.0, video-S3.0-pro. Default: video-S3.0-pro (strongest model)',
		},
		{
			displayName: 'Video Aspect Ratio',
			name: 'videoAspectRatio',
			type: 'options',
			default: '21:9',
			options: [
				{ name: '1:1', value: '1:1' },
				{ name: '16:9', value: '16:9' },
				{ name: '21:9', value: '21:9' },
				{ name: '3:4', value: '3:4' },
				{ name: '4:3', value: '4:3' },
				{ name: '9:16', value: '9:16' },
			],
			description: 'Aspect ratio for the generated video',
		},
		{
			displayName: 'Duration (Ms)',
			name: 'durationMs',
			type: 'options',
			default: 5000,
			description: 'Video duration in milliseconds. Video-S2.0 and video-S2.0-Pro models only support 5 seconds.',
			options: [
				{ name: '5S', value: 5000 },
				{ name: '10S', value: 10000 },
			],
		},
		{
			displayName: 'Wait for Video Return',
			name: 'waitForReturn',
			type: 'boolean',
			required: true,
			default: true,
			description: 'Whether to wait for video generation to complete',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const prompt = this.getNodeParameter('prompt', index) as string;
		const model = this.getNodeParameter('model', index) as string;
		const videoAspectRatio = this.getNodeParameter('videoAspectRatio', index) as string;
		const waitForReturn = this.getNodeParameter('waitForReturn', index) as boolean;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		let durationMs = this.getNodeParameter('durationMs', index) as number;
		if (model === 'video-S2.0' || model === 'video-S2.0-Pro') {
			durationMs = 5000;
		}

		const client = new JimengApiClient({ refreshToken: String(credentials.sessionid) });
		const data = await client.generateVideo(
			prompt,
			'',
			videoAspectRatio,
			model,
			durationMs,
			waitForReturn ? 0 : 1
		);

		return {
			list: data.videoInfoList || [],
			status: data.status,
			historyId: data.historyId,
			failCode: data.failCode || '',
		};
	},
};

export default TextToVideoOperate;
