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

2. Drag "Jimeng Image Generation" or "Jimeng Video Generation" nodes into the editor.

3. Fill in the API Key, configure parameters, and start generating.

4. Can be combined with other nodes (such as: OpenAI, Notion, Telegram, Drive, etc.) to build complete automation workflows.

## Core Features

### ✨ Image Generation
- **Text to Image**: Generate high-quality images from text prompts
- **Image to Image**: Generate new images based on existing images and text prompts
- **Status Query**: Real-time query of image generation task status
- **Multi-model Support**: jimeng-1.4, jimeng-2.0, jimeng-2.0-pro, jimeng-2.1, jimeng-3.0, jimeng-3.1, jimeng-xl-pro
- **Flexible Dimensions**: Support multiple aspect ratios (21:9, 16:9, 3:2, 4:3, 1:1, 3:4, 2:3, 9:16)
- **Async Processing**: Choose to wait for completion or process asynchronously

### 🎬 Video Generation
- **Text to Video**: Generate creative videos through text descriptions
- **Image to Video**: Generate videos based on image materials and text prompts
- **Status Query**: Real-time query of video generation task status
- **Multi-model Support**: Video-S2.0, Video-S2.0-Pro, Video-S3.0, Video-S3.0-Pro
- **Flexible Parameters**: Support multiple aspect ratios and duration settings (5s/10s)
- **Async Processing**: Choose to wait for completion or process asynchronously

## Feature Overview

### 🎯 Core Operations
| Feature Type | Operation Name | Description | Supported Models |
|-------------|---------------|-------------|------------------|
| **Image Generation** | Text to Image | Generate images from text descriptions | jimeng-1.4 to jimeng-xl-pro |
| | Image to Image | Generate new images from existing images | Same as above |
| | Get Image Status | Query image generation task status | - |
| **Video Generation** | Text to Video | Generate videos from text descriptions | Video-S2.0 to Video-S3.0-Pro |
| | Image to Video | Generate videos from images | Same as above |
| | Get Video Status | Query video generation task status | - |

### ⚙️ Parameter Configuration
- **Image Dimensions**: Support custom width and height, multiple aspect ratios
- **Video Duration**: 5 seconds or 10 seconds (depending on model support)
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

### 🔐 Using `sessionid` from Jimeng Cookie

This plugin authenticates using the `sessionid` from the browser Cookie after logging into the [Jimeng official website](https://jimeng.jianying.com/).

#### ✅ How to get `sessionid`:

1. Open browser and visit [https://jimeng.jianying.com/](https://jimeng.jianying.com/) and log in to your account;
2. Press `F12` to open developer tools, switch to **Application** or **Storage**;
3. Find the Cookie under the `jimengai.com` domain, copy the `sessionid` value;
4. Paste the `sessionid` in the n8n node configuration to complete authorization.

#### 🔒 Security Notes
- `sessionid` has a time limit and needs to be updated regularly
- Please keep your authentication information secure and avoid leakage
- It is recommended to verify authentication validity in a test environment first

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
