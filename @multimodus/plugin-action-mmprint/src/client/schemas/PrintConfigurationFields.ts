import { generateNTemplate } from '../locale';

export const PrintConfigurationFieldsSchema = {
	type: 'object',
	properties: {
		templateFile: {
			type: 'string',
			required: true,
			title: generateNTemplate('Template file'),
			'x-decorator': 'FormItem',
			'x-component': 'Input',
		},
		appends: {
			type: 'array',
			'x-component': 'ArrayItems',
			'x-decorator': 'FormItem',
			title: generateNTemplate('Appends'),
			items: {
				type: 'object',
				properties: {
					space: {
						type: 'void',
						'x-component': 'Space',
						properties: {
							name: {
								type: 'string',
								'x-decorator': 'FormItem',
								'x-component': 'Input',
								'x-component-props': {
									placeholder: generateNTemplate('Relation name'),
								},
							},
							filter: {
								type: 'string',
								'x-decorator': 'FormItem',
								'x-component': 'Input',
								'x-component-props': {
									placeholder: generateNTemplate('Filter on related records'),
								},
							},
							remove: {
								type: 'void',
								'x-decorator': 'FormItem',
								'x-component': 'ArrayItems.Remove',
							},
						},
					},
				},
			},
			properties: {
				add: {
					type: 'void',
					title: generateNTemplate('Add relation'),
					'x-component': 'ArrayItems.Addition',
				},
			},
		},
		// appends: {
		// 	type: 'string',
		// 	required: false,
		// 	title: generateNTemplate('Appends'),
		// 	'x-decorator': 'FormItem',
		// 	'x-component': 'Input',
		// },
		outputFormat: {
			type: 'string',
			required: true,
			title: generateNTemplate('Output format'),
			'x-decorator-props': {
				tooltip: generateNTemplate(
					'Render to PDF or template format',
				),
			},
			'x-decorator': 'FormItem',
			'x-component': 'Select',
			'x-component-props': {
				showSearch: false,
				allowClear: false,
				className: 'auto-width',
			},
			enum: [
				{ label: 'xlsx', value: 'xlsx' },
				{ label: 'docx', value: 'docx' },
				{ label: 'pdf', value: 'pdf' },
			],
			default: 'pdf',
		},
	},
};
