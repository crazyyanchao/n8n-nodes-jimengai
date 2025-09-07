import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface JimengApiClientConfig {
	refreshToken: string;
}

export interface GenerateImageParams {
	prompt: string;
	imageUrl: string;
	model: string;
	width: number;
	height: number;
	sampleStrength: number;
	style: string;
	waitForReturn: number;
}

export interface GenerateVideoParams {
	prompt: string;
	imageUrl: string;
	videoAspectRatio: string;
	model: string;
	durationMs: number;
	waitForReturn: number;
}

export interface ImageResponse {
	imageUrls?: string[];
	status: string;
	historyId: string;
	failCode?: string;
}

export interface VideoResponse {
	videoInfoList?: any[];
	status: string;
	historyId: string;
	failCode?: string;
}

export class JimengApiClient {
	private client: AxiosInstance;
	private refreshToken: string;

	constructor(config: JimengApiClientConfig) {
		this.refreshToken = config.refreshToken;
		this.client = axios.create({
			baseURL: 'https://jimeng.jianying.com',
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
			},
		});

		// Add request interceptor to include authentication
		this.client.interceptors.request.use((config) => {
			if (config.headers) {
				config.headers['Authorization'] = `Bearer ${this.refreshToken}`;
			}
			return config;
		});
	}

	async generateImage(
		prompt: string,
		imageUrl: string,
		model: string,
		width: number,
		height: number,
		sampleStrength: number,
		style: string,
		waitForReturn: number
	): Promise<ImageResponse> {
		try {
			const response: AxiosResponse<ImageResponse> = await this.client.post('/commerce/v1/image/generate', {
				prompt,
				imageUrl,
				model,
				width,
				height,
				sampleStrength,
				style,
				waitForReturn,
			});

			return response.data;
		} catch (error) {
			console.error('Image generation error:', error);
			throw new Error(`Image generation failed: ${error.message}`);
		}
	}

	async generateVideo(
		prompt: string,
		imageUrl: string,
		videoAspectRatio: string,
		model: string,
		durationMs: number,
		waitForReturn: number
	): Promise<VideoResponse> {
		try {
			const response: AxiosResponse<VideoResponse> = await this.client.post('/commerce/v1/video/generate', {
				prompt,
				imageUrl,
				videoAspectRatio,
				model,
				durationMs,
				waitForReturn,
			});

			return response.data;
		} catch (error) {
			console.error('Video generation error:', error);
			throw new Error(`Video generation failed: ${error.message}`);
		}
	}

	async getImageStatus(historyId: string): Promise<ImageResponse> {
		try {
			const response: AxiosResponse<ImageResponse> = await this.client.get(`/commerce/v1/image/status/${historyId}`);
			return response.data;
		} catch (error) {
			console.error('Get image status error:', error);
			throw new Error(`Get image status failed: ${error.message}`);
		}
	}

	async getVideoStatus(historyId: string): Promise<VideoResponse> {
		try {
			const response: AxiosResponse<VideoResponse> = await this.client.get(`/commerce/v1/video/status/${historyId}`);
			return response.data;
		} catch (error) {
			console.error('Get video status error:', error);
			throw new Error(`Get video status failed: ${error.message}`);
		}
	}
}
