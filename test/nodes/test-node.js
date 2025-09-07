const { Jimeng } = require('../../dist/nodes/Jimeng/Jimeng.node');

// Test configuration
const testConfig = {
	credentials: {
		jimengCredentialsApi: {
			sessionid: 'test-session-id'
		}
	},
	nodeParameters: {
		resource: 'video',
		operation: 'video:textToVideo',
		prompt: 'A beautiful sunset over the ocean',
		model: 'video-S3.0',
		videoAspectRatio: '16:9',
		durationMs: 5000,
		waitForReturn: true
	}
};

// Mock n8n context
const mockContext = {
	getInputData: () => [{ json: {} }],
	getNodeParameter: (param, index) => {
		if (param === 'resource') return testConfig.nodeParameters.resource;
		if (param === 'operation') return testConfig.nodeParameters.operation;
		if (param === 'prompt') return testConfig.nodeParameters.prompt;
		if (param === 'model') return testConfig.nodeParameters.model;
		if (param === 'videoAspectRatio') return testConfig.nodeParameters.videoAspectRatio;
		if (param === 'durationMs') return testConfig.nodeParameters.durationMs;
		if (param === 'waitForReturn') return testConfig.nodeParameters.waitForReturn;
		return null;
	},
	getCredentials: async (type) => {
		if (type === 'jimengCredentialsApi') {
			return testConfig.credentials.jimengCredentialsApi;
		}
		return {};
	},
	getNode: () => ({ name: 'Jimeng AI Test' }),
	continueOnFail: () => false,
	logger: {
		debug: (msg, data) => console.log('DEBUG:', msg, data),
		error: (msg, data) => console.error('ERROR:', msg, data)
	},
	helpers: {
		constructExecutionMetaData: (data, meta) => data.map(item => ({ ...item, ...meta })),
		returnJsonArray: (data) => [data]
	}
};

// Test function
async function testJimengNode() {
	console.log('Testing Jimeng AI Node...');

	try {
		const node = new Jimeng();
		console.log('Node created successfully');
		console.log('Node description:', node.description.displayName);
		console.log('Available resources:', node.description.properties.map(p => p.name));

		// Test execution (this will fail without real credentials, but we can test the structure)
		console.log('\nTesting node execution structure...');
		const result = await node.execute.call(mockContext);
		console.log('Execution completed, result length:', result[0].length);

	} catch (error) {
		console.log('Expected error (no real credentials):', error.message);
	}
}

// Run test
if (require.main === module) {
	testJimengNode().catch(console.error);
}

module.exports = { testJimengNode, mockContext };
