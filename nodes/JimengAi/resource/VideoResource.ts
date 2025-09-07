import { INodeProperties } from 'n8n-workflow';

export const videoResource: INodeProperties = {
	displayName: 'Resource',
	name: 'resource',
	type: 'options',
	noDataExpression: true,
	options: [
		{
			name: 'Video',
			value: 'video',
		},
	],
	default: 'video',
};

export const videoOperations: INodeProperties = {
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['video'],
		},
	},
	options: [
		{
			name: 'Text to Video',
			value: 'textToVideo',
			description: 'Generate video from text prompt',
			action: 'Text to video a video',
		},
		{
			name: 'Image to Video',
			value: 'imageToVideo',
			description: 'Generate video from image and text prompt',
			action: 'Image to video a video',
		},
		{
			name: 'Get Video Status',
			value: 'getVideoStatus',
			description: 'Get the status of video generation',
			action: 'Get video status a video',
		},
	],
	default: 'textToVideo',
};
