import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class JimengCredentialsApi implements ICredentialType {
	name = 'jimengCredentialsApi';
	displayName = 'Jimeng API Credentials API';
	documentationUrl = 'https://www.volcengine.com/docs/85621/1537648';
	properties: INodeProperties[] = [
		{
			displayName: 'Access Key ID',
			name: 'accessKeyId',
			type: 'string',
			default: '',
			description: 'Volcengine Access Key ID for authentication',
			required: true,
		},
		{
			displayName: 'Secret Access Key',
			name: 'secretAccessKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Volcengine Secret Access Key for authentication',
			required: true,
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'string',
			default: 'cn-north-1',
			description: 'Volcengine region (e.g., cn-north-1, us-east-1)',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://visual.volcengineapi.com',
			url: '/',
			method: 'POST',
		},
	};
}
