import axios, { AxiosInstance, AxiosResponse } from 'axios';
import crypto from 'crypto';

export interface JimengApiClientConfig {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	refreshToken?: string;
}

export interface ImageGenerationRequest {
	prompt: string;
	image_url?: string;
	model?: string;
	width?: number;
	height?: number;
	strength?: number;
	style?: string;
	seed?: number;
	steps?: number;
	guidance_scale?: number;
}

export interface VideoGenerationRequest {
	prompt: string;
	image_url?: string;
	model: string;
	aspect_ratio?: string;
	duration?: number;
	width?: number;
	height?: number;
	seed?: number;
	steps?: number;
	guidance_scale?: number;
	camera_motion?: string;
	first_frame_url?: string;
	last_frame_url?: string;
}

export interface ImageResponse {
	ResponseMetadata: {
		RequestId: string;
		Action: string;
		Version: string;
		Service: string;
		Region: string;
	};
	Result: {
		TaskId: string;
		Status: string;
		Images?: Array<{
			ImageUrl: string;
			Width: number;
			Height: number;
		}>;
		Error?: {
			Code: string;
			Message: string;
		};
	};
}

export interface VideoResponse {
	ResponseMetadata: {
		RequestId: string;
		Action: string;
		Version: string;
		Service: string;
		Region: string;
	};
	Result: {
		TaskId: string;
		Status: string;
		Videos?: Array<{
			VideoUrl: string;
			Width: number;
			Height: number;
			Duration: number;
		}>;
		Error?: {
			Code: string;
			Message: string;
		};
	};
}

export class JimengApiClient {
	private client: AxiosInstance;
	private accessKeyId: string;
	private secretAccessKey: string;
	private region: string;

	constructor(config: JimengApiClientConfig) {
		this.accessKeyId = config.accessKeyId;
		this.secretAccessKey = config.secretAccessKey;
		this.region = config.region;

		this.client = axios.create({
			baseURL: 'https://visual.volcengineapi.com',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'n8n-jimeng-node/1.0.0',
			},
		});

		// Add request interceptor to include authentication
		this.client.interceptors.request.use((config) => {
			if (config.headers && config.data) {
				const signature = this.generateSignature(config.method?.toUpperCase() || 'POST', config.url || '', config.data);
				config.headers['Authorization'] = signature;
			}
			return config;
		});
	}

	private generateSignature(method: string, url: string, body: any): string {
		const timestamp = new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
		const date = timestamp.substr(0, 8);
		const service = 'visual';
		const region = this.region;
		const algorithm = 'HMAC-SHA256';

		// Create canonical request
		const canonicalUri = url;
		const canonicalQueryString = '';
		const canonicalHeaders = `host:visual.volcengineapi.com\nx-date:${timestamp}\n`;
		const signedHeaders = 'host;x-date';
		const hashedPayload = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
		const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedPayload}`;

		// Create string to sign
		const credentialScope = `${date}/${region}/${service}/request`;
		const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

		// Calculate signature
		const kDate = crypto.createHmac('sha256', this.secretAccessKey).update(date).digest();
		const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
		const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
		const kSigning = crypto.createHmac('sha256', kService).update('request').digest();
		const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

		return `${algorithm} Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
	}

	// Image Generation APIs
	async textToImage21(request: ImageGenerationRequest): Promise<ImageResponse> {
		return this.makeRequest('TextToImage', {
			...request,
			model: 'jimeng-2.1'
		});
	}

	async textToImage30(request: ImageGenerationRequest): Promise<ImageResponse> {
		return this.makeRequest('TextToImage', {
			...request,
			model: 'jimeng-3.0'
		});
	}

	async textToImage31(request: ImageGenerationRequest): Promise<ImageResponse> {
		return this.makeRequest('TextToImage', {
			...request,
			model: 'jimeng-3.1'
		});
	}

	async imageToImage30(request: ImageGenerationRequest): Promise<ImageResponse> {
		return this.makeRequest('ImageToImage', {
			...request,
			model: 'jimeng-3.0'
		});
	}

	// Video Generation APIs
	async textToVideo720P(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('TextToVideo', {
			...request,
			model: 'video-3.0-720p'
		});
	}

	async imageToVideo720PFirstFrame(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('ImageToVideo', {
			...request,
			model: 'video-3.0-720p',
			camera_motion: 'first_frame'
		});
	}

	async imageToVideo720PFirstLastFrame(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('ImageToVideo', {
			...request,
			model: 'video-3.0-720p',
			camera_motion: 'first_last_frame'
		});
	}

	async imageToVideo720PCameraMotion(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('ImageToVideo', {
			...request,
			model: 'video-3.0-720p',
			camera_motion: 'camera_motion'
		});
	}

	async textToVideo1080P(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('TextToVideo', {
			...request,
			model: 'video-3.0-1080p'
		});
	}

	async imageToVideo1080PFirstFrame(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('ImageToVideo', {
			...request,
			model: 'video-3.0-1080p',
			camera_motion: 'first_frame'
		});
	}

	async imageToVideo1080PFirstLastFrame(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('ImageToVideo', {
			...request,
			model: 'video-3.0-1080p',
			camera_motion: 'first_last_frame'
		});
	}

	async videoGeneration30Pro(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('VideoGeneration', {
			...request,
			model: 'video-3.0-pro'
		});
	}

	async actionImitation(request: VideoGenerationRequest): Promise<VideoResponse> {
		return this.makeRequest('ActionImitation', {
			...request,
			model: 'action-imitation'
		});
	}

	// Status Check APIs
	async getImageStatus(taskId: string): Promise<ImageResponse> {
		return this.makeRequest('GetImageStatus', { TaskId: taskId });
	}

	async getVideoStatus(taskId: string): Promise<VideoResponse> {
		return this.makeRequest('GetVideoStatus', { TaskId: taskId });
	}

	// Legacy method for backward compatibility
	async generateVideo(
		prompt: string,
		imageUrl: string,
		aspectRatio: string,
		model: string,
		durationMs: number,
		waitForReturn: number
	): Promise<any> {
		// This is a legacy method that maps to the new API structure
		const request: VideoGenerationRequest = {
			prompt,
			image_url: imageUrl,
			aspect_ratio: aspectRatio,
			model,
			duration: durationMs / 1000, // Convert ms to seconds
		};

		// Choose the appropriate method based on model
		if (model.includes('720p')) {
			if (imageUrl) {
				return this.imageToVideo720PFirstFrame(request);
			} else {
				return this.textToVideo720P(request);
			}
		} else if (model.includes('1080p')) {
			if (imageUrl) {
				return this.imageToVideo1080PFirstFrame(request);
			} else {
				return this.textToVideo1080P(request);
			}
		} else if (model.includes('pro')) {
			return this.videoGeneration30Pro(request);
		} else {
			// Default to 720p text to video
			return this.textToVideo720P(request);
		}
	}

	private async makeRequest(action: string, body: any): Promise<any> {
		try {
			const response: AxiosResponse = await this.client.post('/', {
				Action: action,
				Version: '2022-08-31',
				...body
			});

			return response.data;
		} catch (error: any) {
			console.error(`${action} error:`, error);
			throw new Error(`${action} failed: ${error.response?.data?.message || error.message}`);
		}
	}
}
