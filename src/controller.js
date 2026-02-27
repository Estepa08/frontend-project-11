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
    console.log('🎯 handleSubmit для:', url);

    this.view.clearError();
    this.view.setLoading(true);

    if (!url || url.trim() === '') {
      console.log('⛔ URL пустой');
      this.view.setLoading(false);
      this.view.showError('errors.urlRequired');
      return;
    }

    // ✅ Pipeline с использованием методов модели
    const pipeline = [
      this.validateUrl,           // 1. Валидация URL (метод модели)
      this.fetchRss,              // 2. Загрузка через прокси (метод модели)
      this.parseRss,              // 3. Парсинг XML (метод модели)
      this.saveRssData,           // 4. Сохранение в модель (метод модели)
      this.updateView.bind(this), // 5. Обновление UI
      this.showSuccess,           // 6. Показ успеха
      this.resetForm,             // 7. Очистка формы
    ];

    this.runPipeline(url, pipeline)
      .catch((error) => {
        console.log('❌ Pipeline ошибка:', error);
        this.view.showError(error.message || 'errors.unknown');
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
    return this.model.fetchRss(url);
  }

  // ШАГ 3: Парсинг RSS - напрямую из модели!
  parseRss(xmlText) {
    console.log('🔄 Шаг 3: Парсинг RSS');
    return this.model.parseRss(xmlText, this.currentUrl);  // ← просто вызываем метод модели
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