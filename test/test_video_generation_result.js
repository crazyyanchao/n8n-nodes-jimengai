const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 模拟n8n的IExecuteFunctions接口
class MockExecuteFunctions {
    constructor() {
        this.logger = {
            info: (message, data) => console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : ''),
            error: (message, data) => console.error(`[ERROR] ${message}`, data ? JSON.stringify(data, null, 2) : ''),
        };
    }

    getNodeParameter(name, index) {
        const params = {
            taskId: '6575942212481799148',
            outputFormat: 'file', // 测试文件输出
            videoFormat: 'mp4',
            outputFilePath: './test_output/video.mp4',
            enableCache: false
        };
        return params[name];
    }

    async getCredentials(name) {
        return {
            accessKeyId: 'test',
            secretAccessKey: 'test',
            region: 'cn-north-1'
        };
    }
}

// 模拟API响应
const mockApiResponse = {
    "taskId": "6575942212481799148",
    "status": "done",
    "message": "Success",
    "requestId": "20250911233012BC07BF8F452C162DC385",
    "code": 10000,
    "videoUrl": "https://v26-vvecloud.yangyi08.com/bd7ccb2a92895d7793805d6b0ebdb503/68c2fb1e/video/tos/cn/tos-cn-v-242bcc/ooG1DEg7IcoAxiKDIBFAODFAUwCwoAftofUdAb/?a=7073&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1392&bt=1392&cs=0&ft=xztlUQhhe6BMyqx_MWkJD12Nzj&mime_type=video_mp4&qs=13&rc=ajpxNW45cjlnNjgzNGczM0BpajpxNW45cjlnNjgzNGczM0AtZWc0MmRzLS5hLS1kXjBzYSMtZWc0MmRzLS5hLS1kXjBzcw%3D%3D&btag=c0000e00008000&dy_q=1757605129&l=20250911233849B0664C8CC029952E325D"
};

// 模拟JimengApiClient
class MockJimengApiClient {
    async getVideoGeneration30ProResult(taskId) {
        console.log(`模拟API调用，taskId: ${taskId}`);
        return mockApiResponse;
    }
}

// 下载视频函数
async function downloadVideo(videoUrl) {
    try {
        console.log('开始下载视频...');
        const response = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 300000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        console.log('视频下载成功，大小:', response.data.length, 'bytes');
        return Buffer.from(response.data);
    } catch (error) {
        throw new Error(`Failed to download video from URL: ${error.message}`);
    }
}

// 处理视频输出
function processVideoOutput(result, videoBuffer, outputFormat, format, index, executeFunctions, outputFilePath) {
    console.log(`处理视频输出，格式: ${outputFormat}`);

    if (outputFormat === 'file') {
        if (!outputFilePath) {
            throw new Error('Output file path is required for file output format');
        }

        try {
            // 转换为绝对路径
            const absoluteFilePath = path.isAbsolute(outputFilePath)
                ? outputFilePath
                : path.resolve(process.cwd(), outputFilePath);

            // 确保目录存在
            const dir = path.dirname(absoluteFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // 写入文件
            fs.writeFileSync(absoluteFilePath, videoBuffer);

            executeFunctions.logger.info('视频文件保存成功', {
                filePath: absoluteFilePath,
                fileSize: videoBuffer.length
            });

            return {
                ...result,
                filePath: absoluteFilePath,
                fileSize: videoBuffer.length,
                message: `视频已保存到: ${absoluteFilePath}`,
            };
        } catch (fileError) {
            executeFunctions.logger.error('保存视频文件失败', {
                filePath: outputFilePath,
                error: fileError.message
            });
            throw new Error(`Failed to save video file: ${fileError.message}`);
        }
    }

    return result;
}

// 主测试函数
async function testVideoGenerationResult() {
    console.log('开始测试视频生成结果处理...');

    const executeFunctions = new MockExecuteFunctions();
    const client = new MockJimengApiClient();

    try {
        // 获取参数
        const taskId = executeFunctions.getNodeParameter('taskId', 0);
        const outputFormat = executeFunctions.getNodeParameter('outputFormat', 0);
        const videoFormat = executeFunctions.getNodeParameter('videoFormat', 0);
        const outputFilePath = executeFunctions.getNodeParameter('outputFilePath', 0);

        console.log('参数:', { taskId, outputFormat, videoFormat, outputFilePath });

        // 调用API
        const data = await client.getVideoGeneration30ProResult(taskId);
        console.log('API响应:', JSON.stringify(data, null, 2));

        // 检查响应
        if (data.code !== 10000) {
            throw new Error(`API request failed with code ${data.code}: ${data.message || 'Unknown error'}`);
        }

        // 检查状态
        const status = data.status || data.data?.status;
        console.log('任务状态:', status);

        if (status !== 'completed' && status !== 'success' && status !== 'done') {
            console.log('任务未完成，状态:', status);
            return;
        }

        // 获取视频URL
        const videoUrl = data.videoUrl || data.data?.video_url;
        if (!videoUrl) {
            throw new Error('Video URL not found in the response');
        }

        console.log('视频URL:', videoUrl);

        // 下载视频
        const videoBuffer = await downloadVideo(videoUrl);

        // 构建结果
        const result = {
            taskId: taskId,
            status: status || 'completed',
            videoUrl: videoUrl,
            message: data.message,
            requestId: data.requestId || data.request_id,
            code: data.code,
            videoSize: videoBuffer.length,
            cached: false,
        };

        // 处理输出
        const finalResult = processVideoOutput(result, videoBuffer, outputFormat, videoFormat, 0, executeFunctions, outputFilePath);

        console.log('最终结果:', JSON.stringify(finalResult, null, 2));
        console.log('✅ 测试成功!');

    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        console.error('错误详情:', error);
    }
}

testVideoGenerationResult();
