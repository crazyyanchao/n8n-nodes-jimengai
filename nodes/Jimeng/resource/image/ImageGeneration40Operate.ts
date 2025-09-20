import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';

const ImageGeneration40Operate: ResourceOperations = {
	name: 'Image Generation 4.0',
	value: 'imageGeneration40',
	description: 'Generate images using Jimeng 4.0 model with support for multiple input images and advanced features',
	options: [
		{
			displayName: 'Prompt',
			name: 'prompt',
			type: 'string',
			default: '',
			description: 'Text description for image generation (recommended length <=800 characters)',
			required: true,
		},
		{
			displayName: 'Input Images',
			name: 'image_urls',
			type: 'fixedCollection',
			default: {},
			options: [
				{
					name: 'images',
					displayName: 'Images',
					values: [
						{
							displayName: 'Image URL',
							name: 'url',
							type: 'string',
							default: '',
							description: 'URL of the input image (supports up to 10 images)',
						},
					],
				},
			],
			description: 'Input images for image-to-image generation (0-10 images)',
		},
		{
			displayName: 'Size Settings',
			name: 'size_settings',
			type: 'fixedCollection',
			default: {},
			options: [
				{
					name: 'size',
					displayName: 'Size',
					values: [
						{
							displayName: 'Size Type',
							name: 'type',
							type: 'options',
							default: 'area',
							options: [
								{ name: 'Area (Recommended)', value: 'area' },
								{ name: 'Width & Height', value: 'dimensions' },
							],
							description: 'Choose between area-based or dimension-based sizing',
						},
						{
							displayName: 'Area',
							name: 'area',
							type: 'number',
							default: 4194304,
							description: 'Image area in pixels (1024*1024 to 4096*4096)',
							typeOptions: {
								minValue: 1048576, // 1024*1024
								maxValue: 16777216, // 4096*4096
							},
							displayOptions: {
								show: {
									type: ['area'],
								},
							},
						},
						{
							displayName: 'Width',
							name: 'width',
							type: 'number',
							default: 2048,
							description: 'Image width in pixels',
							typeOptions: {
								minValue: 1024,
								maxValue: 4096,
							},
							displayOptions: {
								show: {
									type: ['dimensions'],
								},
							},
						},
						{
							displayName: 'Height',
							name: 'height',
							type: 'number',
							default: 2048,
							description: 'Image height in pixels',
							typeOptions: {
								minValue: 1024,
								maxValue: 4096,
							},
							displayOptions: {
								show: {
									type: ['dimensions'],
								},
							},
						},
					],
				},
			],
			description: 'Image size configuration',
		},
		{
			displayName: 'Scale',
			name: 'scale',
			type: 'number',
			default: 0.5,
			description: 'Text description influence level (0-1, higher means more text influence)',
			typeOptions: {
				minValue: 0,
				maxValue: 1,
			},
		},
		{
			displayName: 'Force Single Image',
			name: 'force_single',
			type: 'boolean',
			default: false,
			description: 'Whether to force generation of only one image (recommended for stable output)',
		},
		{
			displayName: 'Aspect Ratio Settings',
			name: 'aspect_ratio_settings',
			type: 'fixedCollection',
			default: {},
			options: [
				{
					name: 'ratio',
					displayName: 'Aspect Ratio',
					values: [
						{
							displayName: 'Min Ratio',
							name: 'min_ratio',
							type: 'number',
							default: 0.33,
							description: 'Minimum width/height ratio (1/16 to 16)',
							typeOptions: {
								minValue: 0.0625, // 1/16
								maxValue: 16,
							},
						},
						{
							displayName: 'Max Ratio',
							name: 'max_ratio',
							type: 'number',
							default: 3,
							description: 'Maximum width/height ratio (1/16 to 16)',
							typeOptions: {
								minValue: 0.0625, // 1/16
								maxValue: 16,
							},
						},
					],
				},
			],
			description: 'Aspect ratio constraints for generated images',
		},
		{
			displayName: 'Seed',
			name: 'seed',
			type: 'number',
			default: -1,
			description: 'Random seed for image generation (-1 for random)',
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const prompt = this.getNodeParameter('prompt', index) as string;
		const imageUrlsData = this.getNodeParameter('image_urls', index) as any;
		const sizeSettings = this.getNodeParameter('size_settings', index) as any;
		const scale = this.getNodeParameter('scale', index) as number;
		const forceSingle = this.getNodeParameter('force_single', index) as boolean;
		const aspectRatioSettings = this.getNodeParameter('aspect_ratio_settings', index) as any;
		const seed = this.getNodeParameter('seed', index) as number;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Process input images
		let imageUrls: string[] = [];
		if (imageUrlsData && imageUrlsData.images && Array.isArray(imageUrlsData.images)) {
			imageUrls = imageUrlsData.images
				.map((img: any) => img.url)
				.filter((url: string) => url && url.trim() !== '');
		}

		// Process size settings
		let size: number | undefined;
		let width: number | undefined;
		let height: number | undefined;

		if (sizeSettings && sizeSettings.size) {
			const sizeConfig = sizeSettings.size;
			if (sizeConfig.type === 'area') {
				size = sizeConfig.area;
			} else if (sizeConfig.type === 'dimensions') {
				width = sizeConfig.width;
				height = sizeConfig.height;
			}
		}

		// Process aspect ratio settings
		let minRatio: number | undefined;
		let maxRatio: number | undefined;

		if (aspectRatioSettings && aspectRatioSettings.ratio) {
			const ratioConfig = aspectRatioSettings.ratio;
			minRatio = ratioConfig.min_ratio;
			maxRatio = ratioConfig.max_ratio;
		}

		const data = await client.imageGeneration40({
			prompt,
			image_urls: imageUrls.length > 0 ? imageUrls : undefined,
			size,
			width,
			height,
			scale,
			force_single: forceSingle,
			min_ratio: minRatio,
			max_ratio: maxRatio,
			seed,
		});

		return {
			taskId: data.data?.task_id,
			status: data.data?.status,
			images: data.data?.image_urls || [],
			binaryData: data.data?.binary_data_base64 || [],
			error: data.message,
			requestId: data.request_id,
		};
	},
};

export default ImageGeneration40Operate;
