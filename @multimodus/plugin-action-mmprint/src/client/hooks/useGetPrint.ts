import { useFieldSchema } from '@formily/react';
import { useRequest } from '@nocobase/client';

export const useGetPrint = () => {
	const fieldSchema = useFieldSchema();
	const url = `mmprint:get/${fieldSchema['x-uid']}`;
	return useRequest<{ data: { options: any; title: string } }>(
		{
			url,
			params: {
			},
		},
		{
			manual: true,
			cacheKey: url,
		},
	);
};
