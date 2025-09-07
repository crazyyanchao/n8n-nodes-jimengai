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
   - **Image**: Image generation (Text-to-Image 2.1/3.0/3.1, Image-to-Image 3.0)
   - **Video**: Video generation (Text-to-Video, Image-to-Video, Action Imitation, etc.)

4. Select specific operation:
   - Image generation: Text-to-Image 2.1, Text-to-Image 3.0, Text-to-Image 3.1, Image-to-Image 3.0
   - Video generation: Text-to-Video 720P/1080P, Image-to-Video 720P/1080P, Action Imitation, etc.

5. Configure authentication information:
   - AccessKeyID
   - SecretAccessKey
   - Region

6. Fill in parameters and start generating.

7. Can be combined with other nodes (such as: OpenAI, Notion, Telegram, Drive, etc.) to build complete automation workflows.

## Core Features

### ✨ Image Generation
- **Text-to-Image 2.1**: Generate high-quality images from text descriptions
- **Text-to-Image 3.0**: Use Jimeng 3.0 model for text-to-image generation
- **Text-to-Image 3.1**: Use Jimeng 3.1 model for text-to-image generation
- **Image-to-Image 3.0**: Generate new images based on existing images and text prompts
- **Status Query**: Real-time query of image generation task status
- **Multi-model Support**: jimeng-2.1, jimeng-3.0, jimeng-3.1
- **Flexible Dimensions**: Support multiple aspect ratios (21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16)
- **Async Processing**: Choose to wait for completion or process asynchronously

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
- **Status Query**: Real-time query of video generation task status
- **Flexible Parameters**: Support multiple aspect ratios and duration settings (1-10 seconds)
- **Async Processing**: Choose to wait for completion or process asynchronously

## Implemented API Interfaces

### 📸 Image Generation Interfaces (4)
| Interface Name | File Path | Model Version | Description |
|---------------|-----------|---------------|-------------|
| Text-to-Image 2.1 | `TextToImageOperate.ts` | jimeng-2.1 | Generate high-quality images from text descriptions |
| Text-to-Image 3.0 | `TextToImage30Operate.ts` | jimeng-3.0 | Use 3.0 model for text-to-image generation |
| Text-to-Image 3.1 | `TextToImage31Operate.ts` | jimeng-3.1 | Use 3.1 model for text-to-image generation |
| Image-to-Image 3.0 | `ImageToImageOperate.ts` | jimeng-3.0 | Generate new images based on existing images and text prompts |

### 🎬 Video Generation Interfaces (9)
| Interface Name | File Path | Model Version | Description |
|---------------|-----------|---------------|-------------|
| Text-to-Video 720P | `TextToVideo720POperate.ts` | video-3.0-720p | Generate 720P videos from text descriptions |
| Text-to-Video 1080P | `TextToVideo1080POperate.ts` | video-3.0-1080p | Generate 1080P videos from text descriptions |
| Image-to-Video 720P-First Frame | `ImageToVideo720PFirstFrameOperate.ts` | video-3.0-720p | Generate 720P videos based on image first frame |
| Image-to-Video 720P-First Last Frame | `ImageToVideo720PFirstLastFrameOperate.ts` | video-3.0-720p | Generate 720P videos based on image first and last frames |
| Image-to-Video 720P-Camera Motion | `ImageToVideo720PCameraMotionOperate.ts` | video-3.0-720p | Generate 720P videos based on image and camera motion effects |
| Image-to-Video 1080P-First Frame | `ImageToVideo1080PFirstFrameOperate.ts` | video-3.0-1080p | Generate 1080P videos based on image first frame |
| Image-to-Video 1080P-First Last Frame | `ImageToVideo1080PFirstLastFrameOperate.ts` | video-3.0-1080p | Generate 1080P videos based on image first and last frames |
| Video Generation 3.0 Pro | `VideoGeneration30ProOperate.ts` | video-3.0-pro | Use Pro model to generate high-quality videos |
| Action Imitation | `ActionImitationOperate.ts` | action-imitation | Generate videos based on reference video action imitation |

### 📊 Status Query Interfaces (2)
| Interface Name | File Path | Description |
|---------------|-----------|-------------|
| Get Image Status | `GetImageStatusOperate.ts` | Query image generation task status |
| Get Video Status | `GetVideoStatusOperate.ts` | Query video generation task status |

## Feature Overview

### 🎯 Core Operations
| Feature Type | Operation Name | Description | Supported Models |
|-------------|---------------|-------------|------------------|
| **Image Generation** | Text-to-Image 2.1 | Generate images from text descriptions | jimeng-2.1 |
| | Text-to-Image 3.0 | Use 3.0 model for text-to-image generation | jimeng-3.0 |
| | Text-to-Image 3.1 | Use 3.1 model for text-to-image generation | jimeng-3.1 |
| | Image-to-Image 3.0 | Generate new images from existing images and text prompts | jimeng-3.0 |
| | Get Image Status | Query image generation task status | - |
| **Video Generation** | Text-to-Video 720P | Generate 720P videos from text descriptions | video-3.0-720p |
| | Text-to-Video 1080P | Generate 1080P videos from text descriptions | video-3.0-1080p |
| | Image-to-Video 720P-First Frame | Generate 720P videos based on image first frame | video-3.0-720p |
| | Image-to-Video 720P-First Last Frame | Generate 720P videos based on image first and last frames | video-3.0-720p |
| | Image-to-Video 720P-Camera Motion | Generate 720P videos based on image and camera motion effects | video-3.0-720p |
| | Image-to-Video 1080P-First Frame | Generate 1080P videos based on image first frame | video-3.0-1080p |
| | Image-to-Video 1080P-First Last Frame | Generate 1080P videos based on image first and last frames | video-3.0-1080p |
| | Video Generation 3.0 Pro | Use Pro model to generate high-quality videos | video-3.0-pro |
| | Action Imitation | Generate videos based on reference video action imitation | action-imitation |
| | Get Video Status | Query video generation task status | - |

### ⚙️ Parameter Configuration
- **Image Dimensions**: Support custom width and height, multiple aspect ratios (21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16)
- **Video Duration**: 1-10 seconds adjustable (depending on model support)
- **Video Resolution**: 720P, 1080P, custom resolution (Pro model)
- **Image Style**: Anime, oil painting, realistic, sketch, watercolor, etc.
- **Camera Motion**: Pan, tilt, zoom and other camera motion methods
- **Generation Parameters**: Steps, guidance scale, random seed, etc.
- **Generation Mode**: Synchronous wait or asynchronous processing
- **Model Selection**: Multiple Jimeng AI models available

## Use Cases

### 🧠 AIGC Content Creation
- **Automated Content Production**: Batch generate daily reports, news content
- **Marketing Material Creation**: Automated marketing image/video workflow creation
- **Creative Content Production**: AIGC creative script + storyboard + video integrated solution
- **E-commerce Applications**: Automatic product image generation (combined with product descriptions and parameters)

### 🔄 Workflow Integration
- **Multi-platform Publishing**: Combined with Telegram, Discord and other nodes for automatic publishing
- **Data-driven**: Combined with Notion, Airtable and other data source nodes
- **Conditional Logic**: Combined with IF nodes for intelligent content filtering
- **Scheduled Triggers**: Combined with Cron nodes for scheduled content generation

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
