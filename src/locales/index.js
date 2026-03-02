// locales/index.js
export default {
    ru: {
        translation: {
            appTitle: 'RSS агрегатор',

            form: {
                placeholder: 'Ссылка RSS',
                addButton: 'Добавить',
            },

            errors: {
                urlRequired: 'URL не может быть пустым',
                urlInvalid: 'Пожалуйста, введите корректный URL',
                duplicate: 'Этот RSS уже существует',
                notRss: 'URL должен содержать rss, feed или xml',
                timeout: 'Превышено время ожидания. Сервер не отвечает',
                network: 'Ошибка сети. Проверьте подключение к интернету',
                invalidRss: 'Неверный формат RSS',
                proxyUnavailable: '⚠️ Сервис временно недоступен. Попробуйте позже',
                tooManyRequests: '⚠️ Слишком много запросов. Подождите немного',
                unknown: 'Неизвестная ошибка. Попробуйте позже',
            },

            messages: {
                feedAdded: 'RSS лента успешно добавлена',
            },

            loading: 'Загрузка...',
        },
    },
};
