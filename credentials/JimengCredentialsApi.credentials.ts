import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class JimengCredentialsApi implements ICredentialType {
	name = 'jimengCredentialsApi';
	displayName = 'Jimeng API Credentials API';
	documentationUrl = 'https://jimeng.jianying.com';
	properties: INodeProperties[] = [
		{
			displayName: 'Session ID',
			name: 'sessionid',
			type: 'string',
			default: '',
			description: 'Jimeng session ID for authentication',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://jimeng.jianying.com',
			url: '/commerce/v1/benefits/user_credit',
			method: 'POST',
		},
	};
}
