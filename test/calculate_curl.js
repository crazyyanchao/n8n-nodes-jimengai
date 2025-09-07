const crypto = require('crypto');

// 测试凭证
const testCreds = {
    accessKeyId: 'YOUR_ACCESS_KEY_ID',
    secretAccessKey: 'YOUR_SECRET_ACCESS_KEY',
    region: 'cn-north-1'
};

// 任务ID
const taskId = '2025090720510007BC5FA837EEF5C6EED4';

// 签名生成函数
function generateSignature(method, queryString, body, accessKeyId, secretAccessKey, region) {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:\-]|\.\d{3}/g, '');
    const date = now.toISOString().substr(0, 10).replace(/-/g, '');
    const service = 'cv';
    const algorithm = 'HMAC-SHA256';
    const host = 'visual.volcengineapi.com';

    // 创建规范请求
    const canonicalUri = '/';
    const canonicalQueryString = queryString;
    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');
    const canonicalHeaders = `content-type:application/json\nhost:${host}\nx-content-sha256:${payloadHash}\nx-date:${timestamp}\n`;
    const signedHeaders = 'content-type;host;x-content-sha256;x-date';
    const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

    // 创建待签名字符串
    const credentialScope = `${date}/${region}/${service}/request`;
    const stringToSign = `${algorithm}\n${timestamp}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

    // 计算签名
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

// 生成CURL命令
function generateCurlCommand() {
    console.log('🔍 计算CURL命令...\n');

    // 查询参数
    const queryParams = {
        Action: 'CVSync2AsyncGetResult',
        Version: '2022-08-31'
    };

    // 请求体
    const requestBody = {
        req_key: 'jimeng_t2i_v31',
        task_id: taskId,
        req_json: JSON.stringify({
            return_url: true
        })
    };

    // 格式化查询字符串
    const queryString = Object.keys(queryParams)
        .sort()
        .map(key => `${key}=${queryParams[key]}`)
        .join('&');

    // 请求体JSON字符串
    const bodyString = JSON.stringify(requestBody);

    // 生成签名
    const signature = generateSignature('POST', queryString, bodyString, testCreds.accessKeyId, testCreds.secretAccessKey, testCreds.region);

    console.log('📋 请求详情:');
    console.log('URL:', `https://visual.volcengineapi.com/?${queryString}`);
    console.log('Method: POST');
    console.log('Body:', bodyString);
    console.log('');

    console.log('🔐 认证信息:');
    console.log('X-Date:', signature.xDate);
    console.log('X-Content-Sha256:', signature.xContentSha256);
    console.log('Authorization:', signature.authorization);
    console.log('');

    // 生成CURL命令
    const curlCommand = `curl -X POST "https://visual.volcengineapi.com/?${queryString}" \\
  -H "Content-Type: application/json" \\
  -H "User-Agent: n8n-jimeng-node/1.0.0" \\
  -H "X-Date: ${signature.xDate}" \\
  -H "X-Content-Sha256: ${signature.xContentSha256}" \\
  -H "Authorization: ${signature.authorization}" \\
  -d '${bodyString}'`;

    console.log('🚀 完整CURL命令:');
    console.log(curlCommand);
    console.log('');

    console.log('📝 说明:');
    console.log('- 此命令用于查询文生图3.1任务结果');
    console.log('- task_id:', taskId);
    console.log('- 返回图片URL（24小时有效）');
    console.log('- 需要有效的火山引擎API凭证');

    return curlCommand;
}

// 执行计算
if (require.main === module) {
    generateCurlCommand();
}

module.exports = { generateCurlCommand, generateSignature };
