import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ImageToVideo720PCameraMotionOperate: ResourceOperations = {
	name: 'Image to Video 720P Camera Motion',
	value: 'imageToVideo720PCameraMotion',
	description: 'Generate 720P video from image with camera motion using Jimeng 3.0 model',
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
			displayName: 'Template ID',
			name: 'template_id',
			type: 'options',
			default: 'hitchcock_dolly_in',
			options: [
				{ name: 'Central Orbit', value: 'central_orbit' },
				{ name: 'Clockwise Swivel', value: 'clockwise_swivel' },
				{ name: 'Counterclockwise Swivel', value: 'counterclockwise_swivel' },
				{ name: 'Crane Push', value: 'crane_push' },
				{ name: 'Dynamic Orbit', value: 'dynamic_orbit' },
				{ name: 'Handheld', value: 'handheld' },
				{ name: 'Hitchcock Dolly In', value: 'hitchcock_dolly_in' },
				{ name: 'Hitchcock Dolly Out', value: 'hitchcock_dolly_out' },
				{ name: 'Quick Pull Back', value: 'quick_pull_back' },
				{ name: 'Rapid Push Pull', value: 'rapid_push_pull' },
				{ name: 'Robo Arm', value: 'robo_arm' },
			],
			description: 'Camera motion template ID',
			required: true,
		},
		{
			displayName: 'Camera Strength',
			name: 'camera_strength',
			type: 'options',
			default: 'medium',
			options: [
				{ name: 'Weak', value: 'weak' },
				{ name: 'Medium', value: 'medium' },
				{ name: 'Strong', value: 'strong' },
			],
			description: 'Camera motion strength',
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
		let imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const templateId = this.getNodeParameter('template_id', index) as string;
		const cameraStrength = this.getNodeParameter('camera_strength', index) as string;
		const duration = this.getNodeParameter('duration', index) as number;
		const seed = this.getNodeParameter('seed', index) as number;
		const frames = duration * 24 + 1; // Convert duration to frames (24 * n + 1)
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

		const data = await client.imageToVideo720PCameraMotion({
			prompt,
			image_urls: [imageUrl],
			template_id: templateId,
			camera_strength: cameraStrength,
			seed: seed === -1 ? undefined : seed,
			frames: frames,
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

export default ImageToVideo720PCameraMotionOperate;
