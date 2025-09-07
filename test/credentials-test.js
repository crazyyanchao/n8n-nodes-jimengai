const axios = require('axios');
const crypto = require('crypto');

// Test credentials
const testCreds = {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    region: 'cn-north-1'
};

// Format query parameters
function formatQuery(parameters) {
    let requestParametersInit = '';
    for (const key of Object.keys(parameters).sort()) {
        requestParametersInit += key + '=' + parameters[key] + '&';
    }
    return requestParametersInit.slice(0, -1);
}

// Signature generation function
function generateSignature(method, url, queryString, body, accessKeyId, secretAccessKey, region) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = now.toISOString().substr(0, 10).replace(/-/g, '');
    const service = 'cv';
    const algorithm = 'HMAC-SHA256';
    const host = 'visual.volcengineapi.com';

    // Create canonical request
    const canonicalUri = '/';
    const canonicalQueryString = queryString;
    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');
    const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-content-sha256:${payloadHash}\nx-date:${timestamp}\n`;
    const signedHeaders = 'content-type;host;x-content-sha256;x-date';
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // Create string to sign
    const credentialScope = `${date}/${region}/${service}/request`;
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    // Calculate signature
    const kDate = crypto.createHmac('sha256', secretAccessKey).update(date).digest();
    const kRegion = crypto.createHmac('sha256', kDate).update(region).digest();
    const kService = crypto.createHmac('sha256', kRegion).update(service).digest();
    const kSigning = crypto.createHmac('sha256', kService).update('request').digest();
    const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex');

    return {
        authorization: `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
        xDate: timestamp,
        xContentSha256: payloadHash
    };
}

// Test request
async function testCredentials() {
    console.log('🔍 Starting Jimeng API credentials test...\n');

    // Query parameters (following official implementation)
    const queryParams = {
        'Action': 'GetImageStatus',
        'Version': '2022-08-31'
    };
    const formattedQuery = formatQuery(queryParams);

    // Request body parameters
    const bodyParams = {
        "TaskId": "test_connection_validation"
    };
    const formattedBody = JSON.stringify(bodyParams);

    console.log('📋 Test parameters:');
    console.log('Access Key ID:', testCreds.accessKeyId);
    console.log('Secret Access Key:', testCreds.secretAccessKey.substring(0, 10) + '...');
    console.log('Region:', testCreds.region);
    console.log('Query Parameters:', formattedQuery);
    console.log('Request Body:', formattedBody);
    console.log('');

    try {
        // Generate signature
        const signature = generateSignature('POST', 'https://visual.volcengineapi.com', formattedQuery, formattedBody, testCreds.accessKeyId, testCreds.secretAccessKey, testCreds.region);

        console.log('🔐 Generated signature information:');
        console.log('X-Date:', signature.xDate);
        console.log('X-Content-Sha256:', signature.xContentSha256);
        console.log('Authorization:', signature.authorization);
        console.log('');

        // Send request
        console.log('📡 Sending test request...');
        const requestUrl = `https://visual.volcengineapi.com?${formattedQuery}`;
        console.log('Request URL:', requestUrl);

        const response = await axios.post(requestUrl, formattedBody, {
            headers: {
                'Content-Type': 'application/json',
                'X-Date': signature.xDate,
                'X-Content-Sha256': signature.xContentSha256,
                'Authorization': signature.authorization,
                'User-Agent': 'n8n-jimeng-node/1.0.0'
            },
            timeout: 10000
        });

        console.log('✅ Request successful!');
        console.log('Status code:', response.status);
        console.log('Response data:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.log('❌ Request failed!');
        console.log('Error type:', error.name);
        console.log('Error message:', error.message);

        if (error.response) {
            console.log('Response status code:', error.response.status);
            console.log('Response headers:', JSON.stringify(error.response.headers, null, 2));
            console.log('Response data:', JSON.stringify(error.response.data, null, 2));
        } else if (error.request) {
            console.log('Request configuration:', JSON.stringify(error.config, null, 2));
        }

        console.log('\n🔍 Debug information:');
        console.log('Complete error:', error);
    }
}

// Run test
testCredentials().catch(console.error);
