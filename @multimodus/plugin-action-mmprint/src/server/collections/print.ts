import { defineCollection } from '@nocobase/database';

export default defineCollection({
	dumpRules: 'required',
	name: 'mmprint',
	autoGenId: false,
	fields: [
		{
			type: 'uid',
			name: 'key',
			primaryKey: true,
		},
		{
			type: 'json',
			name: 'options',
		},
	],
});
