export default {
  ru: {
    translation: {
      appTitle: 'RSS агрегатор',

      sections: {
        feeds: 'Фиды',
        posts: 'Посты',
      },

      form: {
        label: 'Начните читать RSS сегодня! Это легко, это красиво',
        placeholder: 'Ссылка RSS',
        addButton: 'Добавить',
        example: 'Пример: https://lorem-rss.hexlet.app/feed',
      },

      feeds: {
        postsCount: '{{count}} постов',
        postsCount_zero: '0 постов',
        postsCount_one: '{{count}} пост',
        postsCount_few: '{{count}} поста',
        postsCount_many: '{{count}} постов',
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
        preview: 'Просмотр',
        readFull: 'Читать полностью',
      },

      loading: 'Загрузка...',
    },
  },
}
