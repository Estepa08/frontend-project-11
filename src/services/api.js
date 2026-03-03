// services/api.js
import axios from 'axios';

const PROXY_URL = 'https://allorigins.hexlet.app';
const TIMEOUT = 15000;

const apiClient = axios.create({
    baseURL: PROXY_URL,
    timeout: TIMEOUT,
});

export const fetchRss = (url) => {
    const encodedUrl = encodeURIComponent(url);

    return apiClient
        .get(`/raw?url=${encodedUrl}&disableCache=true`)
        .then((response) => {
            if (typeof response.data !== 'string') {
                throw new Error('errors.network');
            }
            return response.data;
        })
        .catch((error) => {
            console.error('❌ Детали ошибки прокси:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.message,
                code: error.code,
            });

            if (error.code === 'ECONNABORTED') {
                throw new Error('errors.timeout');
            }

            if (error.response?.status === 502 || error.response?.status === 503) {
                throw new Error('errors.proxyUnavailable');
            }

            if (error.response?.status === 429) {
                throw new Error('errors.tooManyRequests');
            }

            throw new Error('errors.network');
        });
};
