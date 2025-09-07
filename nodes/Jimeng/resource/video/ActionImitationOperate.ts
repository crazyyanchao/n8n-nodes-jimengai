import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../help/type/IResource';
import { JimengApiClient } from '../../utils/JimengApiClient';
import { checkLinkType, buildUploadFileData } from '../../../help/utils/NodeUtils';

const ActionImitationOperate: ResourceOperations = {
	name: 'Action Imitation',
	value: 'actionImitation',
	description: 'Generate video by imitating actions from reference video using Jimeng AI',
	options: [
		{
			displayName: 'Reference Video URL',
			name: 'video_url',
			type: 'string',
			default: '',
			description: 'URL of the reference video for action imitation (must be publicly accessible)',
			required: true,
		},
		{
			displayName: 'Image URL',
			name: 'image_url',
			type: 'string',
			default: '',
			description: 'URL of the input image for action imitation (must be publicly accessible)',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		let videoUrl = this.getNodeParameter('video_url', index) as string;
		let imageUrl = this.getNodeParameter('image_url', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		// Handle file upload if needed
		const videoLinkType = checkLinkType(videoUrl);
		if (videoLinkType === 'string') {
			const result = await buildUploadFileData.call(this, videoUrl);
			videoUrl = result.value;
		}

		const imageLinkType = checkLinkType(imageUrl);
		if (imageLinkType === 'string') {
			const result = await buildUploadFileData.call(this, imageUrl);
			imageUrl = result.value;
		}

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Submit action imitation task
		const submitResponse = await client.submitActionImitationTask({
			video_url: videoUrl,
			image_url: imageUrl,
		});

		return {
			taskId: submitResponse.task_id,
			code: submitResponse.code,
			message: submitResponse.message,
		};
	},
};

export default ActionImitationOperate;
