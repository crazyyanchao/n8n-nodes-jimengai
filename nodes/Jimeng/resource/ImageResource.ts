import { INodeProperties } from 'n8n-workflow';

const imageResource: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Image',
			value: 'image',
		},
	],
	default: 'image',
};

const imageOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['image'],
		},
	},
	options: [
		{
			name: 'Text to Image',
			value: 'textToImage',
			description: 'Generate image from text prompt',
			action: 'Text to image an image',
		},
		{
			name: 'Image to Image',
			value: 'imageToImage',
			description: 'Generate image from image and text prompt',
			action: 'Image to image an image',
		},
		{
			name: 'Get Image Status',
			value: 'getImageStatus',
			description: 'Get the status of image generation',
			action: 'Get image status an image',
		},
	],
	default: 'textToImage',
};

export default imageResource;
export { imageOperations };
