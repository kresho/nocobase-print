import { useAPIClient } from '@nocobase/client';

export const usePrintResource = () => {
	const apiClient = useAPIClient();
	return apiClient.resource('mmprint');
};
