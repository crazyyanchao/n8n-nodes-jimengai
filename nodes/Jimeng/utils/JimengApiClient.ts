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

export interface ImageToImage30Request {
	prompt: string;
	image_urls?: string[];
	binary_data_base64?: string[];
	seed?: number;
	scale?: number;
	width?: number;
	height?: number;
	return_url?: boolean;
	logo_info?: LogoInfo;
	aigc_meta?: AIGCMeta;
}

export interface TextToImage21Request {
	prompt: string;
	seed?: number;
	width?: number;
	height?: number;
	use_pre_llm?: boolean;
	use_sr?: boolean;
	return_url?: boolean;
	logo_info?: LogoInfo;
	aigc_meta?: AIGCMeta;
}

export interface TextToImage30Request {
	prompt: string;
	use_pre_llm?: boolean;
	width?: number;
	height?: number;
	seed?: number;
	return_url?: boolean;
	logo_info?: LogoInfo;
	aigc_meta?: AIGCMeta;
}

export interface TextToImage31Request {
	prompt: string;
	use_pre_llm?: boolean;
	width?: number;
	height?: number;
	seed?: number;
	return_url?: boolean;
	logo_info?: LogoInfo;
	aigc_meta?: AIGCMeta;
}

export interface LogoInfo {
	add_logo?: boolean;
	position?: number;
	language?: number;
	opacity?: number;
	logo_text_content?: string;
}

export interface AIGCMeta {
	content_producer?: string;
	producer_id?: string;
	content_propagator?: string;
	propagate_id?: string;
}

export interface TextToImage21Response {
	code: number;
	data: {
		algorithm_base_resp: {
			status_code: number;
			status_message: string;
		};
		binary_data_base64?: string[];
		image_urls?: string[];
		infer_ctx: {
			algorithm_key: string;
			app_key: string;
			created_at: string;
			generate_id: string;
			log_id: string;
			params: any;
			request_id: string;
			session_id: string;
			time_stamp: string;
		};
		llm_result?: string;
		pe_result?: string;
		predict_tags_result?: string;
		rephraser_result?: string;
		request_id: string;
		vlm_result?: string;
	};
	message: string;
	request_id: string;
	status: number;
	time_elapsed: string;
}

export interface TextToImage30Response {
	code: number;
	data: {
		task_id?: string;
		status?: string;
		binary_data_base64?: string[];
		image_urls?: string[];
	};
	message: string;
	request_id: string;
	status: number;
	time_elapsed: string;
}

export interface TextToImage31Response {
	code: number;
	data: {
		task_id?: string;
		status?: string;
		binary_data_base64?: string[];
		image_urls?: string[];
	};
	message: string;
	request_id: string;
	status: number;
	time_elapsed: string;
}

export interface VideoGenerationRequest {
	prompt: string;
	image_url?: string;
	image_urls?: string[];
	binary_data_base64?: string[];
	model?: string;
	aspect_ratio?: string;
	duration?: number;
	frames?: number;
	width?: number;
	height?: number;
	seed?: number;
	steps?: number;
	guidance_scale?: number;
	camera_motion?: string;
	first_frame_url?: string;
	last_frame_url?: string;
	template_id?: string;
	camera_strength?: string;
}

export interface ActionImitationRequest {
	video_url: string;
	image_url: string;
}

export interface HumanSubjectDetectionRequest {
	image_url: string;
}

export interface HumanSubjectDetectionResponse {
	code: number;
	data: {
		task_id?: string;
		status?: string;
		resp_data?: string;
	};
	message: string;
	request_id?: string;
	requestId?: string;
	status?: number;
	time_elapsed?: string;
}

export interface DigitalHumanVideoGenerationRequest {
	image_url: string;
	audio_url: string;
}

export interface DigitalHumanVideoGenerationResponse {
	code: number;
	data?: {
		task_id?: string;
		status?: string;
		video_url?: string;
	};
	message: string;
	request_id?: string;
	requestId?: string;
	status?: number;
	time_elapsed?: string;
	// Direct fields that may be present in some API responses
	taskId?: string;
	videoUrl?: string;
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

export interface ImageToImage30Response {
	code: number;
	data: {
		task_id?: string;
		status?: string;
		binary_data_base64?: string[];
		image_urls?: string[];
	};
	message: string;
	request_id: string;
	status: number;
	time_elapsed: string;
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

export interface AsyncVideoResponse {
	code: number;
	data?: {
		task_id?: string;
		status?: string;
		video_url?: string;
	};
	message: string;
	request_id?: string;
	requestId?: string;
	status?: number;
	time_elapsed?: string;
	// Direct fields that may be present in some API responses
	taskId?: string;
	videoUrl?: string;
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
				const now = new Date();
				const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
				const payloadHash = crypto.createHash('sha256').update(JSON.stringify(config.data)).digest('hex');

				// Extract query string from URL for signature calculation
				const url = new URL(config.url || '', config.baseURL);
				const queryString = url.search.substring(1); // Remove the '?' prefix

				const signature = this.generateSignature(config.method?.toUpperCase() || 'POST', queryString, config.data);

				config.headers['X-Date'] = timestamp;
				config.headers['X-Content-Sha256'] = payloadHash;
				config.headers['Authorization'] = signature;
			}
			return config;
		});
	}

	private generateSignature(method: string, queryString: string, body: any): string {
		const now = new Date();
		const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
		const date = now.toISOString().substr(0, 10).replace(/-/g, '');
		const service = 'cv';
		const region = this.region;
		const algorithm = 'HMAC-SHA256';
		const host = 'visual.volcengineapi.com';

		// Create canonical request
		const canonicalUri = '/';
		const canonicalQueryString = queryString;
		const payloadHash = crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
		const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-content-sha256:${payloadHash}\nx-date:${timestamp}\n`;
		const signedHeaders = 'content-type;host;x-content-sha256;x-date';
		const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

		// Create string to sign
		const credentialScope = `${date}/${region}/${service}/request`;
		const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

		// Calculate signature using the same method as the official example
		const kDate = crypto.createHmac('sha256', this.secretAccessKey).update(date).digest();
		const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
		const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
		const kSigning = crypto.createHmac('sha256', kService).update('request').digest();
		const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

		return `${algorithm} Credential=${this.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
	}

	// Image Generation APIs
	async textToImage21(request: TextToImage21Request): Promise<TextToImage21Response> {
		const requestBody: any = {
			req_key: 'jimeng_high_aes_general_v21_L',
			prompt: request.prompt,
			seed: request.seed || -1,
			width: request.width || 512,
			height: request.height || 512,
			use_pre_llm: request.use_pre_llm !== undefined ? request.use_pre_llm : true,
			use_sr: request.use_sr !== undefined ? request.use_sr : true,
			return_url: request.return_url !== undefined ? request.return_url : true,
		};

		// Add optional parameters
		if (request.logo_info) {
			requestBody.logo_info = request.logo_info;
		}

		if (request.aigc_meta) {
			requestBody.aigc_meta = request.aigc_meta;
		}

		return this.makeRequest('CVProcess', requestBody);
	}

	async textToImage30(request: TextToImage30Request): Promise<TextToImage30Response> {
		// Submit task
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_t2i_v30',
			prompt: request.prompt,
			use_pre_llm: request.use_pre_llm,
			width: request.width,
			height: request.height,
			seed: request.seed,
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Text to Image 3.0 task submission failed: ${submitResponse.message}`);
		}

		// Return the submission response with task_id
		return submitResponse;
	}

	async textToImage31(request: TextToImage31Request): Promise<TextToImage31Response> {
		// Submit task
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_t2i_v31',
			prompt: request.prompt,
			use_pre_llm: request.use_pre_llm,
			width: request.width,
			height: request.height,
			seed: request.seed,
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Text to Image 3.1 task submission failed: ${submitResponse.message}`);
		}

		// Return the submission response with task_id
		return submitResponse;
	}

	async getTextToImage30Result(taskId: string, options?: {
		return_url?: boolean;
		logo_info?: LogoInfo;
		aigc_meta?: AIGCMeta;
	}): Promise<TextToImage30Response> {
		try {
			// Build query parameters
			const reqJson: any = {};

			if (options?.return_url !== undefined) {
				reqJson.return_url = options.return_url;
			}

			if (options?.logo_info) {
				reqJson.logo_info = options.logo_info;
			}

			if (options?.aigc_meta) {
				reqJson.aigc_meta = options.aigc_meta;
			}

			// Query task result
			const queryResponse = await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_t2i_v30',
				task_id: taskId,
				req_json: Object.keys(reqJson).length > 0 ? reqJson : undefined,
			});

			return queryResponse;
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get Text to Image 3.0 result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get Text to Image 3.0 result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get Text to Image 3.0 result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async getTextToImage31Result(taskId: string, options?: {
		return_url?: boolean;
		logo_info?: LogoInfo;
		aigc_meta?: AIGCMeta;
	}): Promise<TextToImage31Response> {
		try {
			// Build query parameters
			const reqJson: any = {};

			if (options?.return_url !== undefined) {
				reqJson.return_url = options.return_url;
			}

			if (options?.logo_info) {
				reqJson.logo_info = options.logo_info;
			}

			if (options?.aigc_meta) {
				reqJson.aigc_meta = options.aigc_meta;
			}

			// Query task result
			const queryResponse = await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_t2i_v31',
				task_id: taskId,
				req_json: Object.keys(reqJson).length > 0 ? reqJson : undefined,
			});

			return queryResponse;
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Server internal error') || error.message.includes('Internal Error')) {
				throw new Error(`Server internal error, please try again later`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get Text to Image 3.1 result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get Text to Image 3.1 result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async imageToImage30(request: ImageToImage30Request): Promise<ImageToImage30Response> {
		// Submit task
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_i2i_v30',
			prompt: request.prompt,
			image_urls: request.image_urls,
			binary_data_base64: request.binary_data_base64,
			seed: request.seed || -1,
			scale: request.scale || 0.5,
			width: request.width,
			height: request.height,
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Image-to-Image 3.0 task submission failed: ${submitResponse.message}`);
		}

		// Return the submission response with task_id
		return submitResponse;
	}

	async getImageToImage30Result(taskId: string, options?: {
		return_url?: boolean;
		logo_info?: LogoInfo;
		aigc_meta?: AIGCMeta;
	}): Promise<ImageToImage30Response> {
		try {
			// Build query parameters
			const reqJson: any = {};

			if (options?.return_url !== undefined) {
				reqJson.return_url = options.return_url;
			}

			if (options?.logo_info) {
				reqJson.logo_info = options.logo_info;
			}

			if (options?.aigc_meta) {
				reqJson.aigc_meta = options.aigc_meta;
			}

			// Query task result
			const queryResponse = await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_i2i_v30',
				task_id: taskId,
				req_json: Object.keys(reqJson).length > 0 ? reqJson : undefined,
			});

			return queryResponse;
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get Image to Image 3.0 result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get Image to Image 3.0 result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get Image to Image 3.0 result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	// Video Generation APIs
	async textToVideo720P(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		// Submit task
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_t2v_v30',
			prompt: request.prompt,
			seed: request.seed || -1,
			frames: request.frames || 121,
			aspect_ratio: request.aspect_ratio || '16:9',
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`TextToVideo 720P task submission failed: ${submitResponse.message}`);
		}

		// Return the submission response with task_id
		return submitResponse;
	}

	async imageToVideo720PFirstFrame(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		return this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_i2v_first_v30',
			prompt: request.prompt,
			image_urls: request.image_url ? [request.image_url] : undefined,
			binary_data_base64: request.binary_data_base64,
			seed: request.seed,
			frames: request.frames
		});
	}

	async getImageToVideo720PFirstFrameResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_i2v_first_v30',
				task_id: taskId
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get 720P image-to-video first frame result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get 720P image-to-video first frame result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get 720P image-to-video first frame result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async imageToVideo720PFirstLastFrame(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		return this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_i2v_first_tail_v30',
			prompt: request.prompt,
			image_urls: request.image_urls,
			binary_data_base64: request.binary_data_base64,
			seed: request.seed,
			frames: request.frames
		});
	}

	async getImageToVideo720PFirstLastFrameResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_i2v_first_tail_v30',
				task_id: taskId
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get 720P image-to-video first-last frame result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get 720P image-to-video first-last frame result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get 720P image-to-video first-last frame result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async imageToVideo720PCameraMotion(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		return this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_i2v_recamera_v30',
			prompt: request.prompt,
			image_urls: request.image_urls,
			binary_data_base64: request.binary_data_base64,
			template_id: request.template_id,
			camera_strength: request.camera_strength,
			seed: request.seed,
			frames: request.frames
		});
	}

	async getImageToVideo720PCameraMotionResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_i2v_recamera_v30',
				task_id: taskId
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get 720P image-to-video camera motion result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get 720P image-to-video camera motion result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get 720P image-to-video camera motion result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async textToVideo1080P(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		// Submit task
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_t2v_v30_1080p',
			prompt: request.prompt,
			seed: request.seed || -1,
			frames: request.frames || 121,
			aspect_ratio: request.aspect_ratio || '16:9',
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`TextToVideo 1080P task submission failed: ${submitResponse.message}`);
		}

		// Return the submission response with task_id
		return submitResponse;
	}

	async imageToVideo1080PFirstFrame(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		return this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_i2v_first_v30_1080',
			prompt: request.prompt,
			image_urls: request.image_urls || (request.image_url ? [request.image_url] : undefined),
			binary_data_base64: request.binary_data_base64,
			seed: request.seed || -1,
			frames: request.frames || 121
		});
	}

	async getImageToVideo1080PFirstFrameResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_i2v_first_v30_1080',
				task_id: taskId
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get 1080P image-to-video first frame result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get 1080P image-to-video first frame result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get 1080P image-to-video first frame result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async imageToVideo1080PFirstLastFrame(request: VideoGenerationRequest): Promise<AsyncVideoResponse> {
		return this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_i2v_first_tail_v30_1080',
			prompt: request.prompt,
			image_urls: request.image_urls,
			binary_data_base64: request.binary_data_base64,
			seed: request.seed || -1,
			frames: request.frames || 121
		});
	}

	async getImageToVideo1080PFirstLastFrameResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_i2v_first_tail_v30_1080',
				task_id: taskId
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get 1080P image-to-video first-last frame result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get 1080P image-to-video first-last frame result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get 1080P image-to-video first-last frame result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async submitVideoGeneration30ProTask(request: VideoGenerationRequest): Promise<{ task_id: string; code: number; message: string }> {
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_ti2v_v30_pro',
			prompt: request.prompt,
			image_urls: request.image_urls,
			binary_data_base64: request.binary_data_base64,
			seed: request.seed || -1,
			frames: request.frames || 121,
			aspect_ratio: request.aspect_ratio || '16:9',
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Video Generation 3.0 Pro task submission failed: ${submitResponse.message}`);
		}

		return {
			task_id: submitResponse.data.task_id,
			code: submitResponse.code,
			message: submitResponse.message,
		};
	}

	async getVideoGeneration30ProResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			const response = await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_ti2v_v30_pro',
				task_id: taskId,
			});

			// Additional validation for the response
			if (!response) {
				throw new Error(`Empty response received for task ${taskId}`);
			}

			// Log the response for debugging (in development)
			if (process.env.NODE_ENV === 'development') {
				console.log('Video Generation 3.0 Pro Result Response:', JSON.stringify(response, null, 2));
			}

			return response;
		} catch (error: any) {
			// Enhanced error handling with more specific messages
			if (error.message.includes('Server internal error') || error.message.includes('Internal Error')) {
				throw new Error(`Server internal error, please try again later`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			if (error.message.includes('QPS limit exceeded')) {
				throw new Error(`Request rate limit exceeded. Please wait a moment and try again.`);
			}
			if (error.message.includes('Concurrency limit exceeded')) {
				throw new Error(`Concurrent request limit exceeded. Please wait a moment and try again.`);
			}
			throw error;
		}
	}

	async submitActionImitationTask(request: ActionImitationRequest): Promise<{ task_id: string; code: number; message: string }> {
		const submitResponse = await this.makeRequest('CVSync2AsyncSubmitTask', {
			req_key: 'jimeng_dream_actor_m1_gen_video_cv',
			video_url: request.video_url,
			image_url: request.image_url,
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Action imitation task submission failed: ${submitResponse.message}`);
		}

		return {
			task_id: submitResponse.data.task_id,
			code: submitResponse.code,
			message: submitResponse.message,
		};
	}

	async getActionImitationResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_dream_actor_m1_gen_video_cv',
				task_id: taskId,
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get action imitation result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get action imitation result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get action imitation result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async getTextToVideo720PResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_t2v_v30',
				task_id: taskId,
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get Text to Video 720P result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get Text to Video 720P result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get Text to Video 720P result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async getTextToVideo1080PResult(taskId: string): Promise<AsyncVideoResponse> {
		try {
			return await this.makeRequest('CVSync2AsyncGetResult', {
				req_key: 'jimeng_t2v_v30_1080p',
				task_id: taskId,
			});
		} catch (error: any) {
			// Provide more detailed error information
			if (error.message.includes('Internal Error')) {
				throw new Error(`Failed to get Text to Video 1080P result: Server internal error - Task ID: ${taskId}. This may be due to the task still being processed or server internal error, please try again later.`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Failed to get Text to Video 1080P result: Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Failed to get Text to Video 1080P result: Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			throw error;
		}
	}

	async getVideoTaskResult(taskId: string): Promise<VideoResponse> {
		const queryResponse = await this.makeRequest('CVSync2AsyncGetResult', {
			req_key: 'jimeng_t2v_v30',
			task_id: taskId,
		});

		if (queryResponse.code !== 10000) {
			throw new Error(`Video task query failed: ${queryResponse.message}`);
		}

		// Convert the response format to match VideoResponse interface
		return {
			ResponseMetadata: {
				RequestId: queryResponse.request_id || '',
				Action: 'GetVideoTaskResult',
				Version: '2022-08-31',
				Service: 'cv',
				Region: this.region,
			},
			Result: {
				TaskId: taskId,
				Status: queryResponse.data?.status || 'Unknown',
				Videos: queryResponse.data?.videos || [],
				Error: queryResponse.data?.error,
			},
		};
	}

	// Human Subject Detection APIs
	async submitHumanSubjectDetectionTask(request: HumanSubjectDetectionRequest): Promise<{ task_id: string; code: number; message: string }> {
		const submitResponse = await this.makeRequest('CVSubmitTask', {
			req_key: 'jimeng_realman_avatar_picture_create_role_omni',
			image_url: request.image_url,
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Human subject detection task submission failed: ${submitResponse.message}`);
		}

		return {
			task_id: submitResponse.data.task_id,
			code: submitResponse.code,
			message: submitResponse.message,
		};
	}

	async getHumanSubjectDetectionResult(taskId: string): Promise<HumanSubjectDetectionResponse> {
		try {
			const response = await this.makeRequest('CVGetResult', {
				req_key: 'jimeng_realman_avatar_picture_create_role_omni',
				task_id: taskId,
			});

			// Additional validation for the response
			if (!response) {
				throw new Error(`Empty response received for task ${taskId}`);
			}

			// Log the response for debugging (in development)
			if (process.env.NODE_ENV === 'development') {
				console.log('Human Subject Detection Result Response:', JSON.stringify(response, null, 2));
			}

			return response;
		} catch (error: any) {
			// Enhanced error handling with more specific messages
			if (error.message.includes('Server internal error') || error.message.includes('Internal Error')) {
				throw new Error(`Server internal error, please try again later`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			if (error.message.includes('QPS limit exceeded')) {
				throw new Error(`Request rate limit exceeded. Please wait a moment and try again.`);
			}
			if (error.message.includes('Concurrency limit exceeded')) {
				throw new Error(`Concurrent request limit exceeded. Please wait a moment and try again.`);
			}
			throw error;
		}
	}

	// Digital Human Video Generation APIs
	async submitDigitalHumanVideoGenerationTask(request: DigitalHumanVideoGenerationRequest): Promise<{ task_id: string; code: number; message: string }> {
		const submitResponse = await this.makeRequest('CVSubmitTask', {
			req_key: 'jimeng_realman_avatar_picture_omni_v2',
			image_url: request.image_url,
			audio_url: request.audio_url,
		});

		if (submitResponse.code !== 10000 || !submitResponse.data?.task_id) {
			throw new Error(`Digital Human Video Generation task submission failed: ${submitResponse.message}`);
		}

		return {
			task_id: submitResponse.data.task_id,
			code: submitResponse.code,
			message: submitResponse.message,
		};
	}

	async getDigitalHumanVideoGenerationResult(taskId: string): Promise<DigitalHumanVideoGenerationResponse> {
		try {
			const response = await this.makeRequest('CVGetResult', {
				req_key: 'jimeng_realman_avatar_picture_omni_v2',
				task_id: taskId,
			});

			// Additional validation for the response
			if (!response) {
				throw new Error(`Empty response received for task ${taskId}`);
			}

			// Log the response for debugging (in development)
			if (process.env.NODE_ENV === 'development') {
				console.log('Digital Human Video Generation Result Response:', JSON.stringify(response, null, 2));
			}

			return response;
		} catch (error: any) {
			// Enhanced error handling with more specific messages
			if (error.message.includes('Server internal error') || error.message.includes('Internal Error')) {
				throw new Error(`Server internal error, please try again later`);
			}
			if (error.message.includes('Task not found')) {
				throw new Error(`Task not found - Task ID: ${taskId}. Possible reasons: invalid task ID or task has expired (12 hours).`);
			}
			if (error.message.includes('Task has expired')) {
				throw new Error(`Task has expired - Task ID: ${taskId}. Please try resubmitting the task request.`);
			}
			if (error.message.includes('QPS limit exceeded')) {
				throw new Error(`Request rate limit exceeded. Please wait a moment and try again.`);
			}
			if (error.message.includes('Concurrency limit exceeded')) {
				throw new Error(`Concurrent request limit exceeded. Please wait a moment and try again.`);
			}
			throw error;
		}
	}

	private async makeRequest(action: string, body: any): Promise<any> {
		try {
			// Create query parameters for Action and Version
			const queryParams = new URLSearchParams({
				Action: action,
				Version: '2022-08-31'
			});

			const response: AxiosResponse = await this.client.post(`/?${queryParams.toString()}`, body);

			// Check for specific error codes and status
			if (response.data.code !== 10000) {
				const errorMessage = this.getErrorMessage(response.data.code, response.data.message);
				// Special handling for Internal Error
				if (response.data.message && response.data.message.includes('Internal Error')) {
					throw new Error(`Server internal error, please try again later`);
				}
				// Handle specific internal error codes
				if (response.data.code === 50500 || response.data.code === 50501) {
					throw new Error(`Server internal error, please try again later`);
				}
				// Handle other specific error codes
				if (response.data.code === 50429) {
					throw new Error(`Request rate limit exceeded, please try again later`);
				}
				if (response.data.code === 50430) {
					throw new Error(`Concurrent request limit exceeded, please try again later`);
				}
				throw new Error(errorMessage);
			}

			// Check for task status errors
			if (response.data.data?.status === 'not_found') {
				throw new Error('Task not found, possible reasons: no such task or task has expired (12 hours)');
			}

			if (response.data.data?.status === 'expired') {
				throw new Error('Task has expired, please try resubmitting the task request');
			}

			return response.data;
		} catch (error: any) {
			console.error(`${action} error:`, error);

			// Handle HTTP 404 errors
			if (error.response?.status === 404) {
				throw new Error('Interface does not exist or request path is incorrect');
			}

			// Handle network errors
			if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
				throw new Error('Network connection failed, please check your network connection');
			}

			// Handle HTTP 500 errors with specific error codes
			if (error.response?.status === 500) {
				// Check if the response contains error data
				if (error.response?.data?.code) {
					const errorCode = error.response.data.code;
					if (errorCode === 50500 || errorCode === 50501) {
						throw new Error('Server internal error, please try again later');
					}
					const errorMessage = this.getErrorMessage(errorCode, error.response.data.message);
					throw new Error(errorMessage);
				}
				throw new Error('Server internal error, please try again later');
			}

			// Re-throw our custom errors
			if (error.message.includes('Task not found') || error.message.includes('Task has expired')) {
				throw error;
			}

			// Handle specific error codes from the API response
			if (error.response?.data?.code) {
				const errorCode = error.response.data.code;
				const errorMessage = this.getErrorMessage(errorCode, error.response.data.message);
				throw new Error(`${action} failed: ${errorMessage}`);
			}

			throw new Error(`${action} failed: ${error.response?.data?.message || error.message}`);
		}
	}

	private getErrorMessage(code: number, message: string): string {
		const errorMessages: { [key: number]: string } = {
			50411: 'Input image pre-audit failed',
			50511: 'Output image post-audit failed',
			50412: 'Input text pre-audit failed',
			50512: 'Output text post-audit failed',
			50413: 'Input text contains sensitive words, copyright words, etc., audit failed',
			50429: 'QPS limit exceeded, please try again later',
			50430: 'Concurrency limit exceeded, please try again later',
			50500: 'Internal error, please retry',
			50501: 'Internal algorithm error, please retry',
		};

		return errorMessages[code] || message || 'Unknown error';
	}
}
