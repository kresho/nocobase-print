import { ArrayItems } from '@formily/antd-v5';
import { useFieldSchema } from '@formily/react';
import {
	Action,
	SchemaSettings,
	SchemaSettingsActionModalItem,
	actionSettingsItems,
	useCollection_deprecated,
	useDataSourceKey,
	useDesignable,
	useRequest,
} from '@nocobase/client';
import { App } from 'antd';
import React from 'react';
import { listByCurrentRoleUrl } from '../constants';
import { useGetPrint } from '../hooks';
import { usePrintResource } from '../hooks/usePrintResource';
import { useTranslation } from '../locale';
import { PrintConfigurationFieldsSchema } from '../schemas';

export function PrintSettingsItem() {
	const { t } = useTranslation();
	const { name } = useCollection_deprecated();
	const dataSourceKey = useDataSourceKey();
	const fieldSchema = useFieldSchema();
	const printResource = usePrintResource();
	const { message } = App.useApp();
	const { data, refresh } = useGetPrint();
	const { dn } = useDesignable();
	return (
		<>
			<SchemaSettingsActionModalItem
				title={ t('Print settings') }
				components={{
					ArrayItems,
				}}
				beforeOpen={() => !data && refresh()}
				schema={PrintConfigurationFieldsSchema}
				initialValues={{
					...data?.data?.options,
				}}
				onSubmit={async (config) => {
					const { ...printSettings } = config;
					fieldSchema['x-response-type'] = printSettings.responseType;
					await printResource.updateOrCreate({
						values: {
							key: fieldSchema['x-uid'],
							options: {
								...printSettings,
								collectionName: name,
								dataSourceKey,
							},
						},
						filterKeys: ['key'],
					});
					dn.emit('patch', {
						schema: {
							'x-response-type': printSettings.responseType,
							'x-uid': fieldSchema['x-uid'],
						},
					});
					message.success(t('Saved successfully'));
				}}
			/>
		</>
	);
}

/**
 * @deprecated
 */
export const printActionSettings = new SchemaSettings({
	name: 'PrintActionSettings',
	items: [
		{
			...actionSettingsItems[0],
			children: [
				...actionSettingsItems[0].children,
				{
					name: 'print settings',
					Component: PrintSettingsItem,
				}
			],
		},
	],
});

/**
 * @deprecated
 */
export const PrintActionDesigner: React.FC = () => {
	const printResource = usePrintResource();
	const fieldSchema = useFieldSchema();
	return (
		<Action.Designer
			linkageAction
			schemaSettings="PrintActionSettings"
			buttonEditorProps={{
				isLink: fieldSchema['x-action'] === 'customize:table:mmprint',
			}}
			linkageRulesProps={{
				type: 'button',
			}}
			removeButtonProps={{
				onConfirmOk() {
					return printResource.destroy({
						filterByTk: fieldSchema['x-uid'],
					});
				},
			}}
		></Action.Designer>
	);
};
