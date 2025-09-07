import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ImageToVideo720PFirstLastFrameOperate: ResourceOperations = {
	name: 'Image to Video 720P First Last Frame',
	value: 'imageToVideo720PFirstLastFrame',
	description: 'Generate 720P video from first and last frame images with Jimeng 3.0 model',
	options: [
		{
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			default: '',
			description: 'Text description for video generation (recommended within 400 characters, max 800 characters)',
			required: true,
		},
		{
			displayName: 'First Frame Image URL',
			name: 'firstFrameUrl',
			type: 'string',
			default: '',
			description: 'URL or path to the first frame image',
			required: true,
		},
		{
			displayName: 'Last Frame Image URL',
			name: 'lastFrameUrl',
			type: 'string',
			default: '',
			description: 'URL or path to the last frame image (must have the same aspect ratio as the first frame image)',
			required: true,
		},
		{
			displayName: 'Frames',
			name: 'frames',
			type: 'number',
			default: 121,
			typeOptions: {
				minValue: 121,
				maxValue: 241,
			},
			description: 'Total number of frames to generate (frames = 24 * n + 1, where n is seconds, supports 5s, 10s)',
		},
		{
			displayName: 'Seed',
			name: 'seed',
			type: 'number',
			default: -1,
			description: 'Random seed as the basis for determining the initial state of diffusion, default -1 (random)',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const prompt = this.getNodeParameter('prompt', index) as string;
		let firstFrameUrl = this.getNodeParameter('firstFrameUrl', index) as string;
		let lastFrameUrl = this.getNodeParameter('lastFrameUrl', index) as string;
		const frames = this.getNodeParameter('frames', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

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

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Submit task
		const submitData = await client.imageToVideo720PFirstLastFrame({
			prompt,
			image_urls: [firstFrameUrl, lastFrameUrl],
			seed: seed === -1 ? undefined : seed,
			frames,
			model: 'video-3.0-720p',
		});

		if (submitData.code !== 10000 || !submitData.data?.task_id) {
			throw new Error(`Task submission failed: ${submitData.message}`);
		}

		// Query task result
		const queryData = await client.getImageToVideo720PFirstLastFrameResult(submitData.data.task_id);

		return {
			taskId: submitData.data.task_id,
			status: queryData.data?.status || 'Unknown',
			videoUrl: queryData.data?.video_url,
			requestId: queryData.request_id,
			code: queryData.code,
			message: queryData.message,
		};
	},
};

export default ImageToVideo720PFirstLastFrameOperate;
