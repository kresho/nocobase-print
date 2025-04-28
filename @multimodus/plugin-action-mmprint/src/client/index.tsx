import { Plugin, SchemaComponentOptions } from '@nocobase/client';
import React from 'react';
import { PrintAction } from './components';
import { printActionSettings } from './components/PrintActionDesigner';
import { PrintInitializer } from './initializer';
import { customizePrintActionSettings } from './schemaSettings';
import { PrintConfigurationFieldsSchema } from './schemas';

const PrintProvider: React.FC = (props: any) => {
	return (
		<SchemaComponentOptions
			scope={{
				PrintConfigurationFieldsSchema,
			}}
			components={{ PrintAction, PrintInitializer }}
		>
			{props.children}
		</SchemaComponentOptions>
	);
};

export class PluginActionPrintClient extends Plugin {
	async load() {
		this.app.use(PrintProvider);
		this.app.schemaSettingsManager.add(customizePrintActionSettings);

		const initializerData = {
			type: 'item',
			title: '{{t("Print")}}',
			name: 'mmprint',
			Component: PrintInitializer,
			schema: {
				'x-action': 'customize:form:mmprint',
				'x-toolbar': 'ActionSchemaToolbar',
				'x-settings': 'actionSettings:mmprint',
				'x-acl-action': 'update',
				'x-acl-action-props': {
					skipScopeCheck: true,
				},
			}
		  };

		  this.app.schemaInitializerManager.addItem('table:configureActions', 'customize.mmprint', initializerData);
		  this.app.schemaInitializerManager.addItem('details:configureActions', 'customize.mmprint', initializerData);


		// @deprecated
		this.app.schemaSettingsManager.add(printActionSettings);
	}
}

export default PluginActionPrintClient;
