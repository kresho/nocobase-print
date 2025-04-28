import { Action, useAPIClient, useRequest, withDynamicSchemaProps } from '@nocobase/client';
import React from 'react';
import { useFieldSchema } from '@formily/react';
import { listByCurrentRoleUrl } from '../constants';
import { useCustomizeRequestActionProps } from '../hooks';
import { PrintActionDesigner } from './PrintActionDesigner';

const components = {
	'customize:table:mmprint': Action.Link,
};

export const PrintAction: React.FC<any> & {
	[key: string]: any;
} = withDynamicSchemaProps((props) => {
	const fieldSchema = useFieldSchema();
	const xAction = fieldSchema['x-action'];
	const Component = components[xAction] || Action;
	return <Component {...props} useProps={useCustomizeRequestActionProps}></Component>;
});

PrintAction.Designer = PrintActionDesigner;
