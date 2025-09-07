import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const TextToImage30Operate: ResourceOperations = {
	name: 'Text to Image 3.0',
	value: 'textToImage30',
	description: 'Generate image from text prompt using Jimeng 3.0 model',
	options: [
		{
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			default: '',
			description: 'Text description for image generation',
			required: true,
		},
		{
			displayName: 'Width',
			name: 'width',
			type: 'number',
			default: 1024,
			description: 'Image width. Common aspect ratios: 21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16.',
		},
		{
			displayName: 'Height',
			name: 'height',
			type: 'number',
			default: 1024,
			description: 'Image height. Common aspect ratios: 21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16.',
		},
		{
			displayName: 'Style',
			name: 'style',
			type: 'options',
			default: 'realistic',
			options: [
				{ name: 'Anime', value: 'anime' },
				{ name: 'Oil Painting', value: 'oil_painting' },
				{ name: 'Realistic', value: 'realistic' },
				{ name: 'Sketch', value: 'sketch' },
				{ name: 'Watercolor', value: 'watercolor' },
			],
			description: 'Image style for generation',
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
		const width = this.getNodeParameter('width', index) as number;
		const height = this.getNodeParameter('height', index) as number;
		const style = this.getNodeParameter('style', index) as string;
		const seed = this.getNodeParameter('seed', index) as number;
		const steps = this.getNodeParameter('steps', index) as number;
		const guidanceScale = this.getNodeParameter('guidance_scale', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		const data = await client.textToImage30({
			prompt,
			width,
			height,
			style,
			seed: seed === -1 ? undefined : seed,
			steps,
			guidance_scale: guidanceScale,
		});

		return {
			taskId: data.Result.TaskId,
			status: data.Result.Status,
			images: data.Result.Images || [],
			error: data.Result.Error,
			requestId: data.ResponseMetadata.RequestId,
		};
	},
};

export default TextToImage30Operate;
