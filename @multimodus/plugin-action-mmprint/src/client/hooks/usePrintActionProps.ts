import { useField, useFieldSchema, useForm } from '@formily/react';
import {
	useAPIClient,
	useActionContext,
	useBlockContext,
	useCollectionRecordData,
	useCompile,
	useDataSourceKey,
	useNavigateNoUpdate,
} from '@nocobase/client';
import { isURL } from '@nocobase/utils/client';
import { App } from 'antd';
import { saveAs } from 'file-saver';

export const useCustomizeRequestActionProps = () => {
	const apiClient = useAPIClient();
	const navigate = useNavigateNoUpdate();
	const actionSchema = useFieldSchema();
	const compile = useCompile();
	const form = useForm();
	const { name: blockType } = useBlockContext() || {};
	// const { getPrimaryKey } = useCollection_deprecated();
	const recordData = useCollectionRecordData();
	const fieldSchema = useFieldSchema();
	const actionField = useField();
	const { setVisible } = useActionContext();
	const { modal, message } = App.useApp();
	const dataSourceKey = useDataSourceKey();
	return {
		async onClick(e?, callBack?) {
			const { skipValidator, onSuccess } = actionSchema?.['x-action-settings'] ?? {};
			const { manualClose, redirecting, redirectTo, successMessage, actionAfterSuccess } = onSuccess || {};
			const xAction = actionSchema?.['x-action'];
			if (skipValidator !== true && xAction === 'customize:form:mmprint') {
				await form.submit();
			}

			let currentRecordData = { ...recordData };
			if (xAction === 'customize:form:mmprint') {
				currentRecordData = form.values;
			}

			actionField.data ??= {};
			actionField.data.loading = true;
			try {
				const res = await apiClient.request({
					url: `/mmprint:print/${fieldSchema['x-uid']}`,
					method: 'POST',
					data: {
						currentRecord: {
							id: currentRecordData.id,
						},
						$nForm: blockType === 'form' ? form.values : undefined,
					},
					responseType: 'blob',
				});
				if (res.headers['content-disposition']) {
					const regex = /attachment;\s*filename="([^"]+)"/;
					const match = res.headers['content-disposition'].match(regex);
					if (match?.[1]) {
						saveAs(res.data, match[1]);
					}
				}
			} catch (e) {
				console.error(JSON.stringify(e.response?.data));
				message.error("Error generating document");
			} finally {
				actionField.data.loading = false;
			}
		},
	};
};
