import { PROXY_TIMEOUT, PROXY_URL } from '../utils/constants.js';

export default {
    proxy: {
        url: PROXY_URL,
        timeout: PROXY_TIMEOUT,
    },
    i18n: {
        lng: 'ru',
        fallbackLng: 'ru',
    },
    ui: {
        messageDisplayTime: 5000,
    },
};
