// locales/index.js
export default {
    ru: {
        translation: {
            appTitle: 'RSS агрегатор',

            sections: {
                feeds: 'Фиды',
                posts: 'Посты',
            },

            form: {
                placeholder: 'Ссылка RSS',
                addButton: 'Добавить',
            },

            errors: {
                urlRequired: 'Не должно быть пустым',
                urlInvalid: 'Ссылка должна быть валидным URL',
                duplicate: 'RSS уже существует',
                notRss: 'URL должен содержать rss, feed или xml',
                timeout: 'Превышено время ожидания. Сервер не отвечает',
                network: 'Ошибка сети',
                invalidRss: 'Ресурс не содержит валидный RSS',
                proxyUnavailable: '⚠️ Сервис временно недоступен. Попробуйте позже',
                tooManyRequests: '⚠️ Слишком много запросов. Подождите немного',
                unknown: 'Неизвестная ошибка. Попробуйте позже',
            },

            messages: {
                feedAdded: 'RSS успешно загружен',
            },

            modal: {
                close: 'Закрыть',
                readFull: 'Читать полностью',
            },

            loading: 'Загрузка...',
        },
    },
};
