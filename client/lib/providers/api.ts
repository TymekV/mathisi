import { apiBaseUrl } from '@/constants/apiBaseUrl';
import { getAuthToken, setAuthToken } from '@/lib/auth/token';
import type { paths } from '@/types/api';
import createFetchClient from 'openapi-fetch';
import createClient from 'openapi-react-query';

const fetchClient = createFetchClient<paths>({
    baseUrl: apiBaseUrl,
});

fetchClient.use({
    async onRequest({ request }) {
        const token = await getAuthToken();
        if (!token) {
            return;
        }

        const headers = new Headers(request.headers);
        headers.set('Authorization', token);
        return new Request(request, { headers });
    },
    async onResponse({ response }) {
        if (response.status !== 401) {
            return;
        }

        await setAuthToken(null);
    },
});

export const apiClient = createClient(fetchClient);
