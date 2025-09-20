import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../../help/type/IResource';
import { JimengApiClient } from '../../../utils/JimengApiClient';

const HumanVideoGenerationOperate: ResourceOperations = {
	name: 'Human Video Generation',
	value: 'humanVideoGeneration',
	description: 'Generate digital human video using image and audio (Step 2 of Digital Human Quick Mode). Output: MP4 video format. Note: RTF30 service may have increased processing time during high load periods.',
	options: [
		{
			displayName: 'Image URL',
			name: 'imageUrl',
			type: 'string',
			default: '',
			description: 'URL of the input image (must be publicly accessible). Supported formats: JPG(JPEG), PNG, JFIF. Recommended: JPG format. Requirements: < 5MB, < 4096*4096 pixels. For best results: single person, large face proportion, front-facing image.',
			required: true,
		},
		{
			displayName: 'Audio URL',
			name: 'audioUrl',
			type: 'string',
			default: '',
			description: 'URL of the input audio (must be publicly accessible). Recommended duration: < 15 seconds for optimal generation quality. Longer audio may result in quality degradation.（MP3 has been tested and there are no issues.）',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const audioUrl = this.getNodeParameter('audioUrl', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Submit task
		const submitData = await client.submitDigitalHumanVideoGenerationTask({
			image_url: imageUrl,
			audio_url: audioUrl,
		});

		return {
			taskId: submitData.task_id,
			status: 'submitted',
			message: submitData.message,
			imageUrl: imageUrl,
			audioUrl: audioUrl,
		};
	},
};

export default HumanVideoGenerationOperate;
