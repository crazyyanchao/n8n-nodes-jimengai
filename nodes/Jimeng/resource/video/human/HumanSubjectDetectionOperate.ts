import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { ResourceOperations } from '../../../../help/type/IResource';
import { JimengApiClient } from '../../../utils/JimengApiClient';

const HumanSubjectDetectionOperate: ResourceOperations = {
	name: 'Human Subject Detection',
	value: 'humanSubjectDetection',
	description: 'Detect human subjects in images for digital human avatar creation',
	options: [
		{
			displayName: 'Image URL',
			name: 'imageUrl',
			type: 'string',
			default: '',
			description: 'URL of the image to analyze (must be publicly accessible)',
			required: true,
		},
	],
	async call(this: IExecuteFunctions, index: number): Promise<IDataObject> {
		const imageUrl = this.getNodeParameter('imageUrl', index) as string;
		const credentials = await this.getCredentials('jimengCredentialsApi');

		const client = new JimengApiClient({
			accessKeyId: credentials.accessKeyId as string,
			secretAccessKey: credentials.secretAccessKey as string,
			region: credentials.region as string,
		});

		// Submit task
		const submitData = await client.submitHumanSubjectDetectionTask({
			image_url: imageUrl,
		});

		return {
			taskId: submitData.task_id,
			status: 'submitted',
			message: submitData.message,
			imageUrl: imageUrl,
		};
	},
};

export default HumanSubjectDetectionOperate;
