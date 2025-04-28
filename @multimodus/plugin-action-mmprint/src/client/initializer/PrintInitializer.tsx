import { merge, uid } from '@formily/shared';
import { SchemaInitializerItem, useDesignable, useSchemaInitializer, useSchemaInitializerItem } from '@nocobase/client';
import React from 'react';
import { usePrintResource } from '../hooks/usePrintResource';

export const getNewSchema = () => {
	return {
		title: '{{ t("Print") }}',
		'x-component': 'PrintAction',
		'x-action': 'customize:form:mmprint',
		'x-toolbar': 'ActionSchemaToolbar',
		'x-settings': 'actionSettings:mmprint',
		'x-decorator': 'PrintAction.Decorator',
		'x-uid': uid(),
		'x-action-settings': {
			onSuccess: {
				manualClose: false,
				redirecting: false,
				successMessage: '{{t("Print success")}}',
			},
		},
	};
};

export const PrintInitializer: React.FC<any> = (props) => {
	const printResource = usePrintResource();
	const itemConfig = useSchemaInitializerItem();
	const { insert } = useSchemaInitializer();
	const schema = getNewSchema();

	return (
		<SchemaInitializerItem
			{...itemConfig}
			onClick={async () => {
				const s = merge(schema || {}, itemConfig.schema || {});
				itemConfig?.schemaInitialize?.(s);

				// create a custom request
				await printResource.create({
					values: {
						key: s['x-uid'],
					},
				});

				insert(s);
			}}
		/>
	);
};
