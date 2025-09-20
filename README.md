# n8n-nodes-jimengai

[![English](https://img.shields.io/badge/English-Click-yellow)](README.md)
[![中文文档](https://img.shields.io/badge/中文文档-点击查看-orange)](README-zh.md)

> Seamlessly integrate Jimeng's image/video generation capabilities into n8n for visual AI content creation workflows.

---

### 🧩 Plugin Introduction

`n8n-nodes-jimengai` is an n8n plugin based on Jimeng, supporting **image generation** and **video generation** core operation nodes, allowing users to complete high-quality AIGC image/video creation tasks through process automation.

[n8n](https://n8n.io/) is a workflow automation platform with [fair-code license](https://docs.n8n.io/reference/license/).

[Quick Start](#quick-start)  
[Core Features](#core-features)  
[Use Cases](#use-cases)  
[Authentication](#authentication)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Quick Start

1. Install the plugin in n8n:

   ```bash
   npm install n8n-nodes-jimengai
   ```

2. Drag "Jimeng" node into the editor.

3. Select resource type:
   - **Image**: Image generation (Text-to-Image 2.1/3.0/3.1/4.0, Image-to-Image 3.0)
   - **Video**: Video generation (Text-to-Video, Image-to-Video, Action Imitation, Digital Human Video, etc.)

4. Select specific operation:
   - Image generation: Text-to-Image 2.1, Text-to-Image 3.0, Text-to-Image 3.1, Text-to-Image 4.0, Image-to-Image 3.0, various result queries
   - Video generation: Text-to-Video 720P/1080P, Image-to-Video 720P/1080P, Action Imitation, Video Generation 3.0 Pro, Digital Human Video Generation, etc.
   - Digital Human features: Human Subject Detection, Digital Human Video Generation, Digital Human Result Query, etc.
   - Status queries: Various image result queries, video result queries, digital human result queries, etc.

5. Configure authentication information:
   - AccessKeyID
   - SecretAccessKey
   - Region

   **Note**: You may not see "Connection tested successfully" during credential configuration. This is normal behavior. Authentication will be validated during actual API calls.

6. Fill in parameters and start generating.

7. **Async Task Processing**:
   - For async interfaces (Text-to-Image 3.0/3.1/4.0, all video generation, digital human features), task ID will be returned
   - Use corresponding status query interfaces to periodically check task status
   - Retrieve generated images, videos, or digital human content when tasks are completed

8. Can be combined with other nodes (such as: OpenAI, Notion, Telegram, Drive, etc.) to build complete automation workflows.

## Core Features

### ✨ Image Generation
- **Text-to-Image 2.1**: Generate high-quality images from text descriptions (synchronous)
- **Text-to-Image 3.0**: Use Jimeng 3.0 model for text-to-image generation (asynchronous)
- **Text-to-Image 3.1**: Use Jimeng 3.1 model for text-to-image generation (asynchronous)
- **Text-to-Image 4.0**: Use Jimeng 4.0 model for advanced image generation with multi-image input support (asynchronous)
- **Image-to-Image 3.0**: Generate new images based on existing images and text prompts (asynchronous)
- **Result Query**: Text-to-Image 3.0 result query, Text-to-Image 3.1 result query, Text-to-Image 4.0 result query, Image-to-Image 3.0 result query
- **Multi-model Support**: jimeng-2.1, jimeng-3.0, jimeng-3.1, jimeng-4.0
- **Flexible Dimensions**: Support multiple aspect ratios (21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16)
- **Advanced Features**: Multi-image input, smart dimension settings, aspect ratio constraints, force single image generation
- **Watermark Settings**: Support custom watermark text, position, transparency, etc.
- **AIGC Metadata**: Support content producer, distributor and other metadata settings
- **Async Processing**: Choose to wait for completion or process asynchronously

### 🤖 Digital Human Features
- **Human Subject Detection**: Detect whether images contain human subjects for digital human creation
- **Digital Human Video Generation**: Generate digital human videos based on images and audio (MP4 format)
- **Result Query**: Digital human video generation result query, human subject detection result query
- **Multi-format Output**: Support Base64, binary data, file saving and other output formats
- **Local Caching**: Support video file local caching for improved reuse efficiency
- **Smart Detection**: Automatically detect human subjects in images to ensure digital human generation quality
- **Audio Synchronization**: Support precise audio-video synchronization, recommended audio within 15 seconds
- **Async Processing**: Support async task submission and status query

### 🎬 Video Generation
- **Text-to-Video 720P**: Generate 720P videos from text descriptions
- **Text-to-Video 1080P**: Generate 1080P videos from text descriptions
- **Image-to-Video 720P-First Frame**: Generate 720P videos based on image first frame
- **Image-to-Video 720P-First Last Frame**: Generate 720P videos based on image first and last frames
- **Image-to-Video 720P-Camera Motion**: Generate 720P videos based on image and camera motion effects
- **Image-to-Video 1080P-First Frame**: Generate 1080P videos based on image first frame
- **Image-to-Video 1080P-First Last Frame**: Generate 1080P videos based on image first and last frames
- **Video Generation 3.0 Pro**: Use Pro model to generate high-quality videos
- **Action Imitation**: Generate videos based on reference video action imitation
- **Video Result Query**: Real-time query of various video generation task status and results
- **Flexible Parameters**: Support multiple aspect ratios and duration settings (1-10 seconds)
- **Async Processing**: Choose to wait for completion or process asynchronously

## Implemented API Interfaces

### 📸 Image Generation Interfaces (9)
| Interface Name | File Path | Model Version | Description | Test |
|---------------|-----------|---------------|-------------|------|
| Text-to-Image 2.1 | `TextToImageOperate.ts` | jimeng-2.1 | Generate high-quality images from text descriptions (synchronous) | Success |
| Text-to-Image 3.0 | `TextToImage30Operate.ts` | jimeng-3.0 | Use 3.0 model for text-to-image generation (asynchronous) | Success |
| Text-to-Image 3.1 | `TextToImage31Operate.ts` | jimeng-3.1 | Use 3.1 model for text-to-image generation (asynchronous) | Success |
| Text-to-Image 4.0 | `ImageGeneration40Operate.ts` | jimeng-4.0 | Use 4.0 model for advanced image generation with multi-image input support (asynchronous) | Success |
| Image-to-Image 3.0 | `ImageToImageOperate.ts` | jimeng-3.0 | Generate new images based on existing images and text prompts (asynchronous) | Success |
| Text-to-Image 3.0 Result | `TextToImage30ResultOperate.ts` | - | Query text-to-image 3.0 task results | Success |
| Text-to-Image 3.1 Result | `TextToImage31ResultOperate.ts` | - | Query text-to-image 3.1 task results | Success |
| Text-to-Image 4.0 Result | `ImageGeneration40ResultOperate.ts` | - | Query text-to-image 4.0 task results | Success |
| Image-to-Image 3.0 Result | `ImageToImage30ResultOperate.ts` | - | Query image-to-image 3.0 task results | Success |

### 🎬 Video Generation Interfaces (18)
| Interface Name | File Path | Model Version | Description | Test |
|---------------|-----------|---------------|-------------|------|
| Text-to-Video 720P | `TextToVideo720POperate.ts` | video-3.0-720p | Generate 720P videos from text descriptions | Success |
| Text-to-Video 1080P | `TextToVideo1080POperate.ts` | video-3.0-1080p | Generate 1080P videos from text descriptions | Success |
| Image-to-Video 720P-First Frame | `ImageToVideo720PFirstFrameOperate.ts` | video-3.0-720p | Generate 720P videos based on image first frame | Success |
| Image-to-Video 720P-First Last Frame | `ImageToVideo720PFirstLastFrameOperate.ts` | video-3.0-720p | Generate 720P videos based on image first and last frames | Success |
| Image-to-Video 720P-Camera Motion | `ImageToVideo720PCameraMotionOperate.ts` | video-3.0-720p | Generate 720P videos based on image and camera motion effects | Success |
| Image-to-Video 1080P-First Frame | `ImageToVideo1080PFirstFrameOperate.ts` | video-3.0-1080p | Generate 1080P videos based on image first frame | Success |
| Image-to-Video 1080P-First Last Frame | `ImageToVideo1080PFirstLastFrameOperate.ts` | video-3.0-1080p | Generate 1080P videos based on image first and last frames | Success |
| Video Generation 3.0 Pro | `VideoGeneration30ProOperate.ts` | video-3.0-pro | Use Pro model to generate high-quality videos | Success |
| Action Imitation | `ActionImitationOperate.ts` | action-imitation | Generate videos based on reference video action imitation | Success |
| Text-to-Video 720P Result | `TextToVideo720PResultOperate.ts` | - | Query text-to-video 720P task results | Success |
| Text-to-Video 1080P Result | `TextToVideo1080PResultOperate.ts` | - | Query text-to-video 1080P task results | Success |
| Image-to-Video 720P-First Frame Result | `ImageToVideo720PFirstFrameResultOperate.ts` | - | Query image-to-video 720P-first frame task results | Success |
| Image-to-Video 720P-First Last Frame Result | `ImageToVideo720PFirstLastFrameResultOperate.ts` | - | Query image-to-video 720P-first last frame task results | Success |
| Image-to-Video 720P-Camera Motion Result | `ImageToVideo720PCameraMotionResultOperate.ts` | - | Query image-to-video 720P-camera motion task results | Success |
| Image-to-Video 1080P-First Frame Result | `ImageToVideo1080PFirstFrameResultOperate.ts` | - | Query image-to-video 1080P-first frame task results | Success |
| Image-to-Video 1080P-First Last Frame Result | `ImageToVideo1080PFirstLastFrameResultOperate.ts` | - | Query image-to-video 1080P-first last frame task results | Success |
| Video Generation 3.0 Pro Result | `VideoGeneration30ProResultOperate.ts` | - | Query video generation 3.0 Pro task results | Success |
| Action Imitation Result | `ActionImitationResultOperate.ts` | - | Query action imitation task results | Success |

### 🤖 Digital Human Feature Interfaces (4)
| Interface Name | File Path | Model Version | Description | Test |
|---------------|-----------|---------------|-------------|------|
| Human Subject Detection | `HumanSubjectDetectionOperate.ts` | - | Detect whether images contain human subjects | Success |
| Human Subject Detection Result | `HumanSubjectDetectionResultOperate.ts` | - | Query human subject detection task results | Success |
| Digital Human Video Generation | `HumanVideoGenerationOperate.ts` | digital-human | Generate digital human videos based on images and audio | Success |
| Digital Human Video Generation Result | `HumanVideoGenerationResultOperate.ts` | - | Query digital human video generation task results | Success |

## Feature Overview

### 🎯 Core Operations
| Feature Type | Operation Name | Description | Supported Models |
|-------------|---------------|-------------|------------------|
| **Image Generation** | Text-to-Image 2.1 | Generate images from text descriptions (synchronous) | jimeng-2.1 |
| | Text-to-Image 3.0 | Use 3.0 model for text-to-image generation (asynchronous) | jimeng-3.0 |
| | Text-to-Image 3.1 | Use 3.1 model for text-to-image generation (asynchronous) | jimeng-3.1 |
| | Text-to-Image 4.0 | Use 4.0 model for advanced image generation (asynchronous) | jimeng-4.0 |
| | Image-to-Image 3.0 | Generate new images from existing images and text prompts (asynchronous) | jimeng-3.0 |
| | Text-to-Image 3.0 Result | Query text-to-image 3.0 task results | - |
| | Text-to-Image 3.1 Result | Query text-to-image 3.1 task results | - |
| | Text-to-Image 4.0 Result | Query text-to-image 4.0 task results | - |
| | Image-to-Image 3.0 Result | Query image-to-image 3.0 task results | - |
| **Video Generation** | Text-to-Video 720P | Generate 720P videos from text descriptions | video-3.0-720p |
| | Text-to-Video 1080P | Generate 1080P videos from text descriptions | video-3.0-1080p |
| | Image-to-Video 720P-First Frame | Generate 1080P videos based on image first frame | Success | video-3.0-720p |
| | Image-to-Video 720P-First Last Frame | Generate 1080P videos based on image first and last frames | Success | video-3.0-720p |
| | Image-to-Video 720P-Camera Motion | Generate 720P videos based on image and camera motion effects | Success | video-3.0-720p |
| | Image-to-Video 1080P-First Frame | Generate 1080P videos based on image first frame | video-3.0-1080p |
| | Image-to-Video 1080P-First Last Frame | Generate 1080P videos based on image first and last frames | video-3.0-1080p |
| | Video Generation 3.0 Pro | Use Pro model to generate high-quality videos | Success | video-3.0-pro |
| | Action Imitation | Generate videos based on reference video action imitation | Success | action-imitation |
| **Digital Human Features** | Human Subject Detection | Detect whether images contain human subjects | - |
| | Digital Human Video Generation | Generate digital human videos based on images and audio | digital-human |
| | Human Subject Detection Result | Query human subject detection task results | - |
| | Digital Human Video Generation Result | Query digital human video generation task results | - |
| **Status Query** | Various Video Result Queries | Query various video generation task status and results | - |

### ⚙️ Parameter Configuration
- **Image Dimensions**: Support custom width and height, multiple aspect ratios (21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16)
- **Advanced Image Settings**: Area settings, aspect ratio constraints, multi-image input (up to 10 images), force single image generation
- **Video Duration**: 1-10 seconds adjustable (depending on model support)
- **Video Resolution**: 720P, 1080P, custom resolution (Pro model)
- **Image Style**: Anime, oil painting, realistic, sketch, watercolor, etc.
- **Camera Motion**: Pan, tilt, zoom and other camera motion methods
- **Generation Parameters**: Steps, guidance scale, random seed, text influence, etc.
- **Watermark Settings**: Custom watermark text, position (four corners), transparency, language (Chinese/English)
- **AIGC Metadata**: Content producer, distributor, unique identifier and other metadata configuration
- **Digital Human Configuration**: Image URL, audio URL, output format, local caching settings
- **File Output**: Support Base64, binary, file saving, caching and other output formats
- **Generation Mode**: Synchronous wait or asynchronous processing
- **Model Selection**: Multiple Jimeng AI models available (including jimeng-4.0, digital-human, etc.)

## Use Cases

### 🧠 AIGC Content Creation
- **Automated Content Production**: Batch generate daily reports, news content
- **Marketing Material Creation**: Automated marketing image/video workflow creation
- **Creative Content Production**: AIGC creative script + storyboard + video integrated solution
- **E-commerce Applications**: Automatic product image generation (combined with product descriptions and parameters)
- **Digital Human Applications**: Virtual anchors, educational videos, customer service robots, personalized broadcasts
- **Multimedia Production**: Integrated content production pipeline for images, text, audio, and video

### 🔄 Workflow Integration
- **Multi-platform Publishing**: Combined with Telegram, Discord and other nodes for automatic publishing
- **Data-driven**: Combined with Notion, Airtable and other data source nodes
- **Conditional Logic**: Combined with IF nodes for intelligent content filtering
- **Scheduled Triggers**: Combined with Cron nodes for scheduled content generation

## Async Processing Mode

### 🔄 Synchronous vs Asynchronous Interfaces

#### Synchronous Interfaces (Immediate Results)
- **Text-to-Image 2.1**: Returns generated images immediately after task submission
- Suitable for quick generation needs, no waiting time required

#### Asynchronous Interfaces (Require Status Query)
- **Text-to-Image 3.0/3.1/4.0**: Returns task ID after submission, requires periodic status query
- **Image-to-Image 3.0**: Returns task ID after submission, requires periodic status query
- **All Video Generation Interfaces**: Returns task ID after submission, requires periodic result query
- **Digital Human Feature Interfaces**: Human subject detection, digital human video generation are all asynchronous interfaces
- Suitable for high-quality generation needs with longer processing time

### 📋 Async Processing Workflow

1. **Submit Generation Task**: Use the corresponding generation interface to submit a task
2. **Get Task ID**: Record the returned task ID
3. **Status Query**: Use the corresponding result query interface to periodically check task status
   - Image generation: Text-to-Image 3.0 result, Text-to-Image 3.1 result, Image-to-Image 3.0 result
   - Video generation: Various video result query interfaces
4. **Get Results**: Retrieve generated images or videos when task is completed
5. **Optional Configuration**: Configure watermarks and AIGC metadata during result query

### ⏱️ Task Status Description

- **pending**: Task submitted, waiting for processing
- **processing**: Task is being processed
- **completed**: Task completed, results can be retrieved
- **failed**: Task failed, check error information

### 🔍 Result Query Features

#### Image Result Query Features
- **Watermark Settings**: Support adding custom watermarks, choose position, transparency, language
- **AIGC Metadata**: Support setting content producer, distributor and other metadata information
- **Multiple Return Formats**: Support returning image URLs (24-hour validity) or Base64 encoded data
- **Status Monitoring**: Real-time monitoring of task progress and completion status

#### Video Result Query Features
- **Multi-resolution Support**: 720P, 1080P and other resolution result queries
- **Multiple Generation Modes**: Text-to-video, image-to-video, action imitation result queries
- **Status Monitoring**: Real-time monitoring of video generation progress and completion status

## Technical Architecture

### 🏗️ Modular Design
- **Resource Builder**: `ResourceBuilder` dynamically loads image and video resource modules
- **API Client**: `JimengApiClient` encapsulates Jimeng API interaction logic
- **Operation Modules**: Independent image/video operation implementations, supporting extensions
- **Utility Classes**: Module loading, node utilities, request utilities and other auxiliary functions

### 🔧 Core Features
- **Type Safety**: Complete TypeScript type definitions
- **Error Handling**: Comprehensive error handling and logging mechanisms
- **Async Support**: Support for both synchronous and asynchronous generation modes
- **Status Management**: Real-time task status query and monitoring

## Authentication

### 🔐 Using Jimeng API Authentication Information

This plugin authenticates using Jimeng API's `AccessKeyID` and `SecretAccessKey`.

#### ✅ How to get authentication information:

1. Visit [Jimeng official website](https://jimeng.jianying.com/) and log in to your account;
2. Go to API management page, create or get API keys;
3. Copy the `AccessKeyID` and `SecretAccessKey` values;
4. Fill in the authentication information in n8n node configuration to complete authorization.

#### 🔒 Security Notes
- Please keep your authentication information secure and avoid leakage
- It is recommended to rotate API keys regularly to ensure security
- It is recommended to verify authentication validity in a test environment first
- Authentication information has a time limit and needs to be updated regularly

## Troubleshooting

### ❌ Authentication Configuration Issues

**Problem**: When configuring Jimeng Credentials in n8n, you encounter "Couldn't connect with these settings" or "Bad request - please check your parameters" errors, and cannot see the "Connection tested successfully" prompt.

**Cause**: The authentication test endpoints for Volcengine Jimeng API require specific permissions that regular users may not have access to.

**Solutions**:
1. **Ignore authentication test errors**: This is normal behavior. Authentication will be validated during actual API calls
2. **Use the node directly**: After configuring authentication information, use the Jimeng node directly for image or video generation
3. **Verify authentication information**: Ensure AccessKeyID, SecretAccessKey, and Region are configured correctly
4. **Check permissions**: Ensure your Jimeng account has the corresponding API call permissions

**Verification method**:
- Try running a simple image generation task
- If the task executes successfully, the authentication configuration is correct
- If the task fails, please check if the authentication information is correct

### 🔧 Common Issues and Solutions

#### Task Status Query Issues
**Problem**: Unable to query task status or get results for async operations.

**Solutions**:
1. **Check Task ID**: Ensure the task ID is correctly passed from the generation interface
2. **Verify Interface Match**: Use the correct result query interface for the corresponding generation interface
3. **Check Task Status**: Ensure the task is not in "failed" status before querying results
4. **Retry Mechanism**: Implement retry logic for status queries with appropriate intervals

#### Generation Parameter Issues
**Problem**: Generation fails or produces unexpected results.

**Solutions**:
1. **Parameter Validation**: Check if all required parameters are provided
2. **Model Compatibility**: Ensure parameter values are compatible with the selected model
3. **Image Format**: For image-to-image operations, ensure input images are in supported formats
4. **Size Limits**: Check if image/video dimensions are within supported ranges

#### API Rate Limiting
**Problem**: API calls are being rate limited or rejected.

**Solutions**:
1. **Reduce Frequency**: Implement delays between API calls
2. **Batch Processing**: Group multiple requests when possible
3. **Error Handling**: Implement proper retry logic with exponential backoff
4. **Monitor Usage**: Track API usage to stay within limits

#### Watermark and Metadata Issues
**Problem**: Watermarks or AIGC metadata not appearing correctly in generated content.

**Solutions**:
1. **Check Watermark Settings**: Verify watermark text, position, and transparency settings
2. **Language Support**: Ensure watermark language matches the content language
3. **Metadata Format**: Check if AIGC metadata fields are properly formatted
4. **Result Query Configuration**: Ensure watermark and metadata are configured during result query

#### Async Task Timeout Issues
**Problem**: Async tasks taking too long or timing out.

**Solutions**:
1. **Check Task Status**: Monitor task status regularly to avoid timeouts
2. **Adjust Timeout Settings**: Increase timeout values for complex generation tasks
3. **Task Priority**: Check if there are high-priority tasks in the queue
4. **Resource Availability**: Ensure sufficient resources are available for generation

## Compatibility

- **Minimum n8n version**: 1.0.0
- **Node.js version**: >=22.16
- **Tested version**: n8n 1.0.0+

## Resources

* [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Jimeng Official Website](https://jimeng.jianying.com/)
* [n8n Workflow Templates](https://github.com/crazyyanchao/n8n-workflow-template)

---

**Note**: Using this node requires a valid Jimeng account and corresponding API permissions. Please ensure compliance with Jimeng's terms of use and API call limits.
