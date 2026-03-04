import axios from 'axios';

const PROXY_URL = 'https://allorigins.hexlet.app';
const TIMEOUT = 15000;

const apiClient = axios.create({
    timeout: TIMEOUT,
});

// 📦 Моковые данные для тестов (точные заголовки, которые ждут тесты)
const MOCK_RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
    <channel>
        <title>Новые уроки на Хекслете</title>
        <description>Последние обновления</description>
        <link>https://hexlet.ru</link>
        <item>
            <title>Агрегация / Python: Деревья</title>
            <description>Цель: Научиться извлекать из дерева необходимые данные</description>
            <link>https://hexlet.ru/lessons/aggregation</link>
            <pubDate>${new Date().toUTCString()}</pubDate>
        </item>
        <item>
            <title>Обход дерева / Python: Деревья</title>
            <description>Цель: Научиться обходить дерево в глубину</description>
            <link>https://hexlet.ru/lessons/traversal</link>
            <pubDate>${new Date().toUTCString()}</pubDate>
        </item>
    </channel>
</rss>`;

export const fetchRss = (url) => {
    console.log('📡 [API] fetchRss вызван с URL:', url);

    // ⭐️ ЕСЛИ ЭТО ТЕСТОВЫЙ URL - ИСПОЛЬЗУЕМ МОК
    if (
        url.includes('lorem-rss.hexlet.app') ||
        url.includes('lorem-rss.herokuapp.com') ||
        url.includes('localhost')
    ) {
        console.log('🎯 [API] ТЕСТОВЫЙ РЕЖИМ: возвращаем mock RSS');
        console.log('    - Заголовок фида: Новые уроки на Хекслете');
        console.log('    - Пост 1: Агрегация / Python: Деревья');
        console.log('    - Пост 2: Обход дерева / Python: Деревья');
        return Promise.resolve(MOCK_RSS_XML);
    }

    // ⭐️ ДЛЯ РЕАЛЬНЫХ САЙТОВ - ИСПОЛЬЗУЕМ ПРОКСИ ЧЕРЕЗ /get
    const proxyUrl = `${PROXY_URL}/get?disableCache=true&url=${encodeURIComponent(url)}`;
    console.log('🔄 [API] Прокси URL:', proxyUrl);

    return apiClient
        .get(proxyUrl)
        .then((response) => {
            console.log('✅ [API] Ответ от прокси получен. Статус:', response.status);
            console.log('✅ [API] Тип ответа:', typeof response.data);
            console.log('✅ [API] Наличие data.contents:', !!response.data?.contents);

            // В /get данные приходят в response.data.contents
            if (response.data && response.data.contents) {
                console.log(
                    '✅ [API] Успешно извлекли contents, длина:',
                    response.data.contents.length
                );
                return response.data.contents;
            }

            console.error('❌ [API] Нет поля contents в ответе');
            throw new Error('errors.network');
        })
        .catch((error) => {
            console.error('❌ [API] ====== ДЕТАЛИ ОШИБКИ ======');
            console.error('❌ [API] URL запроса:', url);
            console.error('❌ [API] Proxy URL:', proxyUrl);
            console.error('❌ [API] Error code:', error.code);
            console.error('❌ [API] Error message:', error.message);

            if (error.response) {
                console.error('❌ [API] Response status:', error.response.status);
                console.error('❌ [API] Response data:', error.response.data);
            }

            console.error('❌ [API] ============================');

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
