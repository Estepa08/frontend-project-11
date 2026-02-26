export default {
  ru: {
    translation: {
      // Заголовки
      appTitle: 'RSS агрегатор',

      // Форма
      form: {
        placeholder: 'Ссылка RSS',
        addButton: 'Добавить',
      },

      // Ошибки валидации (для Yup)
      errors: {
        urlRequired: 'URL не может быть пустым',
        urlInvalid: 'Пожалуйста, введите корректный URL',
        duplicate: 'Этот RSS уже существует',
        notRss: 'URL должен содержать rss, feed или xml',
      },

      // Сообщения
      messages: {
        feedAdded: 'RSS лента успешно добавлена',
      },

      // Состояния загрузки
      loading: 'Загрузка...',
    },
  },
};
