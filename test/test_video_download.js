const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function testVideoDownload() {
    const videoUrl = 'https://v26-vvecloud.yangyi08.com/bd7ccb2a92895d7793805d6b0ebdb503/68c2fb1e/video/tos/cn/tos-cn-v-242bcc/ooG1DEg7IcoAxiKDIBFAODFAUwCwoAftofUdAb/?a=7073&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1392&bt=1392&cs=0&ft=xztlUQhhe6BMyqx_MWkJD12Nzj&mime_type=video_mp4&qs=13&rc=ajpxNW45cjlnNjgzNGczM0BpajpxNW45cjlnNjgzNGczM0AtZWc0MmRzLS5hLS1kXjBzYSMtZWc0MmRzLS5hLS1kXjBzcw%3D%3D&btag=c0000e00008000&dy_q=1757605129&l=20250911233849B0664C8CC029952E325D';

    console.log('开始测试视频下载...');
    console.log('视频URL:', videoUrl);

    try {
        // 测试下载视频
        const response = await axios.get(videoUrl, {
            responseType: 'arraybuffer',
            timeout: 300000, // 5 minutes timeout
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log('下载成功!');
        console.log('响应状态:', response.status);
        console.log('内容类型:', response.headers['content-type']);
        console.log('内容长度:', response.headers['content-length']);
        console.log('实际数据长度:', response.data.length);

        // 保存到文件
        const outputPath = path.join(__dirname, 'test_video.mp4');
        fs.writeFileSync(outputPath, response.data);

        console.log('视频已保存到:', outputPath);
        console.log('文件大小:', fs.statSync(outputPath).size, 'bytes');

        // 检查文件是否有效
        const stats = fs.statSync(outputPath);
        if (stats.size > 0) {
            console.log('✅ 视频下载测试成功!');
        } else {
            console.log('❌ 下载的文件为空');
        }

    } catch (error) {
        console.error('❌ 下载失败:', error.message);
        if (error.response) {
            console.error('响应状态:', error.response.status);
            console.error('响应头:', error.response.headers);
        }
    }
}

testVideoDownload();
