import axios from 'axios';

const PROXY_URL = 'https://allorigins.hexlet.app';
const TIMEOUT = 15000;

const apiClient = axios.create({
    timeout: TIMEOUT,
});

export const fetchRss = (url) => {
    console.log('📡 [API] Запрос к прокси для:', url);

    const proxyUrl = `${PROXY_URL}/get?url=${encodeURIComponent(url)}&disableCache=true`;
    console.log('🔄 [API] Прокси URL:', proxyUrl);

    return apiClient
        .get(proxyUrl)
        .then((response) => {
            console.log('✅ [API] Статус ответа:', response.status);

            if (response.status !== 200) {
                throw new Error('errors.network');
            }

            // Данные могут быть в разных форматах
            const data = response.data;
            console.log('📦 [API] Тип ответа:', typeof data);

            // Если пришла строка - это уже XML
            if (typeof data === 'string') {
                console.log('✅ [API] Получили XML строку, длина:', data.length);
                return data;
            }

            // Если пришёл объект - ищем contents
            if (data && data.contents) {
                console.log('✅ [API] Получили JSON с contents, длина:', data.contents.length);
                return data.contents;
            }

            console.error('❌ [API] Неожиданный формат ответа:', data);
            throw new Error('errors.network');
        })
        .catch((error) => {
            console.error('❌ [API] Ошибка:', error.message);
            throw new Error('errors.network');
        });
};
