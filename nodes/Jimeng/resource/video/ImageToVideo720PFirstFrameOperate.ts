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
			description: 'Text description for video generation (recommended within 400 characters, max 800 characters)',
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
		let imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const frames = this.getNodeParameter('frames', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
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

		// Submit task
		const submitData = await client.imageToVideo720PFirstFrame({
			prompt,
			image_url: imageUrl,
			frames,
			seed: seed === -1 ? undefined : seed,
		});

		if (submitData.code !== 10000 || !submitData.data?.task_id) {
			throw new Error(`Task submission failed: ${submitData.message}`);
		}

		// Query task result
		const queryData = await client.getImageToVideo720PFirstFrameResult(submitData.data.task_id);

		// Check task status
		if (queryData.data?.status === 'not_found') {
			throw new Error('Task not found, possible reasons: no such task or task has expired (12 hours)');
		}

		if (queryData.data?.status === 'expired') {
			throw new Error('Task has expired, please try resubmitting the task request');
		}

		return {
			taskId: submitData.data.task_id,
			status: queryData.data?.status || 'Unknown',
			videoUrl: queryData.data?.video_url,
			requestId: queryData.request_id,
			code: queryData.code,
			message: queryData.message,
			timeElapsed: queryData.time_elapsed,
		};
	},
};

export default ImageToVideo720PFirstFrameOperate;
