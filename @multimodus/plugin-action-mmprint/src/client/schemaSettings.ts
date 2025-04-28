import { useFieldSchema } from '@formily/react';
import {
	AfterSuccess,
	ButtonEditor,
	RefreshDataBlockRequest,
	RemoveButton,
	SchemaSettings,
	SchemaSettingsLinkageRules,
	SecondConFirm,
	useCollection,
	useCollectionRecord,
	useSchemaToolbar,
} from '@nocobase/client';
import { PrintSettingsItem } from './components/PrintActionDesigner';

export const customizePrintActionSettings = new SchemaSettings({
	name: 'actionSettings:mmprint',
	items: [
		{
			name: 'editButton',
			Component: ButtonEditor,
			useComponentProps() {
				const fieldSchema = useFieldSchema();
				return {
					isLink: fieldSchema['x-action'] === 'customize:table:mmprint',
				};
			},
		},
		{
			name: 'print settings',
			Component: PrintSettingsItem,
		},
		{
			name: 'delete',
			sort: 100,
			Component: RemoveButton as any,
			useComponentProps() {
				const { removeButtonProps } = useSchemaToolbar();
				return removeButtonProps;
			},
		},
	],
});
