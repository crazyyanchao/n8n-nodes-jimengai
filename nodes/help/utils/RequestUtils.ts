import { IExecuteFunctions, NodeOperationError } from 'n8n-workflow';
import { IRequestOptions } from 'n8n-workflow';


class RequestUtils {
	static async originRequest(
		this: IExecuteFunctions,
		options: IRequestOptions,
		clearAccessToken = false,
	) {
		const credentials = await this.getCredentials('wechatOfficialAccountCredentialsApi');

		options.baseURL = `https://${credentials.baseUrl}`;

		return this.helpers.requestWithAuthentication.call(this, 'wechatOfficialAccountCredentialsApi', options, {
			// @ts-ignore
			credentialsDecrypted: {
				data: {
					...credentials,
					accessToken: clearAccessToken ? '' : credentials.accessToken,
				},
			},
		});
	}

	static async request(this: IExecuteFunctions, options: IRequestOptions) {
		return RequestUtils.originRequest.call(this, options).then((text) => {
			const data: any = JSON.parse(text);
			// Handle access token expiration once
			if (data.errcode && data.errcode === 42001) {
				return RequestUtils.originRequest.call(this, options, true)
					.then((text) => {
						const data: any = JSON.parse(text);
						if (data.errcode && data.errcode !== 0) {
							throw new NodeOperationError(
								this.getNode(),
								`Request Error: ${data.errcode}, ${data.errmsg}`,
							);
						}
						return data;
					});
			}

			if (data.errcode && data.errcode !== 0) {
				throw new NodeOperationError(
					this.getNode(),
					`Request Error: ${data.errcode}, ${data.errmsg}`,
				);
			}
			return data;
		});
	}
}

export default RequestUtils;
