export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view
      .on('submit', this.handleSubmit.bind(this))
      .on('feedClick', this.handleFeedClick.bind(this));

    this.updateView();
  }

  handleSubmit(url) {
    this.view.clearFormError(); // ← очищаем только ошибки формы
    this.view.setLoading(true);

    if (!url || url.trim() === '') {
      this.view.setFormError('errors.urlRequired'); // ← ошибка формы
      this.view.setLoading(false);
      return;
    }

    const pipeline = [
      this.validateUrl,
      this.fetchRss,
      this.parseRss,
      this.saveRssData,
      this.updateView.bind(this),
      this.showSuccess,
      this.resetForm,
    ];

    this.runPipeline(url, pipeline)
      .catch((error) => {
        console.log('🔥 Поймана ошибка в pipeline:', error);
        console.log('🔥 error.message:', error.message);
        console.log('🔥 error.stack:', error.stack);

        if (
          error.message === 'errors.network' ||
          error.message === 'errors.timeout' ||
          error.message === 'errors.invalidRss'
        ) {
          console.log('✅ Определена сетевая ошибка:', error.message);
          this.view.setNetworkError(error.message);
        } else {
          console.log('❌ Неизвестная ошибка, message:', error.message);
          this.view.setNetworkError('errors.unknown');
        }
      })
      .finally(() => {
        this.view.setLoading(false);
      });
  }

  // ШАГ 1: Валидация
  validateUrl(url) {
    console.log('🔍 Шаг 1: Валидация URL');
    return this.model.validateUrl(url);
  }

  // ШАГ 2: Загрузка RSS
  fetchRss(url) {
    console.log('📡 Шаг 2: Загрузка RSS');
    this.currentUrl = url;
    return this.model.fetchRss(url);
  }

  // ШАГ 3: Парсинг RSS - напрямую из модели!
  parseRss(xmlText) {
    console.log('🔄 Шаг 3: Парсинг RSS');
    return this.model.parseRss(xmlText, this.currentUrl); // ← просто вызываем метод модели
  }

  // ШАГ 4: Сохранение данных
  saveRssData({ feed, posts }) {
    console.log('💾 Шаг 4: Сохранение данных');
    this.model.feedsManager.addFeed(feed);
    this.model.postsManager.addPosts(posts);
    return Promise.resolve({ feed, posts });
  }

  // ШАГ 5: Показ успеха
  showSuccess() {
    console.log('✅ Шаг 5: Показ успеха');
    this.view.showSuccess('messages.feedAdded');
    return Promise.resolve();
  }

  // ШАГ 6: Очистка формы
  resetForm() {
    console.log('🧹 Шаг 6: Очистка формы');
    return Promise.resolve(this.view.resetForm());
  }

  handleFeedClick(id) {
    console.log('📌 Клик по фиду:', id);

    const feed = this.model.feedsManager.getFeedById(id);
    if (!feed) return;

    const posts = this.model.postsManager.getPosts(feed.url);
    this.view.displayPosts(posts, feed.title);
  }

  updateView() {
    const feeds = this.model.getFeeds();
    this.view.updateFeeds(feeds);
  }

  runPipeline(initialValue, steps) {
    console.log('🚀 Запуск pipeline');
    return steps.reduce((promise, step) => {
      return promise.then((value) => step.call(this, value));
    }, Promise.resolve(initialValue));
  }
}
