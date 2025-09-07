/*
 * n8n Custom Node: Jimeng AI
 * =====================================================================
 * Dependencies
 * ---------------------------------------------------------------------
 * - Depends on axios, sharp, uuid, and crc-full packages.
 * ---------------------------------------------------------------------
 * Supported Operations
 *   • Video Generation (Text to Video, Image to Video, Get Video Status)
 *   • Image Generation (Text to Image, Image to Image, Get Image Status)
 * ---------------------------------------------------------------------
 * Author: Tony.Ma — 2025‑01‑06
 */

/* -------------------------------------------------------------------
 * Dependencies Import
 * ---------------------------------------------------------------- */
import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

// Import helper utilities
import ResourceBuilder from '../help/builder/ResourceBuilder';
import ModuleLoadUtils from '../help/utils/ModuleLoadUtils';
import { ResourceOperations } from '../help/type/IResource';

/* -------------------------------------------------------------------
 * Resource Builder Setup
 * ---------------------------------------------------------------- */
const resourceBuilder = new ResourceBuilder();
ModuleLoadUtils.loadModules(__dirname, 'resource/*.js').forEach((resource) => {
	resourceBuilder.addResource(resource);
	ModuleLoadUtils.loadModules(__dirname, `resource/${resource.value}/*.js`).forEach((operate: ResourceOperations) => {
		resourceBuilder.addOperate(resource.value, operate);
	})
});

/* -------------------------------------------------------------------
 * Node Implementation
 * ---------------------------------------------------------------- */
export class JimengAI implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Jimeng AI',
		name: 'jimengAi',
		icon: 'file:./jimeng.logo.svg',
		group: ['transform'],
		version: 1,
		description: 'Generate images and videos using Jimeng AI within n8n workflows.',
		defaults: {
			name: 'Jimeng AI',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'jimengCredentialsApi',
				required: true,
			},
		],
		properties: resourceBuilder.build(),
	};

	/* ------------------------------ Execution Entry ------------------------------ */
	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let responseData: IDataObject = {};
		let returnData = [];

		const resource = this.getNodeParameter('resource', 0);
		const operation = this.getNodeParameter('operation', 0);

		const callFunc = resourceBuilder.getCall(resource, operation);

		if (!callFunc) {
			throw new NodeOperationError(this.getNode(), 'Method not implemented: ' + resource + '.' + operation);
		}

		// Iterate through all input items and execute corresponding operations
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				this.logger.debug('Calling function', {
					resource,
					operation,
					itemIndex,
				});

				responseData = await callFunc.call(this, itemIndex);
			} catch (error) {
				this.logger.error('Function call error', {
					resource,
					operation,
					itemIndex,
					errorMessage: error.message,
					stack: error.stack,
				});

				// If continue on fail is set, log error and continue
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message
						},
						pairedItem: itemIndex,
					});
					continue
				} else {
					throw new NodeOperationError(this.getNode(), error, {
						message: error.message,
						itemIndex,
					});
				}
			}
			const executionData = this.helpers.constructExecutionMetaData(
				this.helpers.returnJsonArray(responseData as IDataObject),
				{ itemData: { item: itemIndex } },
			);
			returnData.push(...executionData);
		}

		return [returnData];
	}
}


