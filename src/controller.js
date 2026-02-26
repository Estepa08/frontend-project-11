export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view
      .on('submit', this.handleSubmit.bind(this))
      .on('feedClick', this.handleFeedClick.bind(this));

    // Инициализируем список фидов в состоянии View
    this.updateView();
  }

  handleSubmit(url) {
    console.log('1️⃣ handleSubmit с url:', url);
    this.view.clearError();

    if (!url || url.trim() === '') {
      console.log('2️⃣ URL пустой, показываем ошибку');
      this.view.showError('URL cannot be empty');
      return;
    }

    console.log('3️⃣ Запускаем pipeline для url:', url);

    const pipeline = [
      this.validateWithModel,
      this.addToModel,
      this.updateView.bind(this),
      this.resetForm,
    ];

    this.runPipeline(url, pipeline)
      .then((result) => {
        console.log('✅ Pipeline успешно завершен, результат:', result);
      })
      .catch((error) => {
        console.log('❌ Ошибка в pipeline:', error);
        this.view.showError(error.message);
      });
  }

  handleFeedClick(id) {
    console.log('🖱️ feed click:', id);
    // TODO: удаление
  }

  validateWithModel(url) {
    console.log('🔍 validateWithModel для url:', url);
    return this.model
      .validateUrl(url)
      .then((validUrl) => {
        console.log('✅ validateWithModel успешно, валидный url:', validUrl);
        return validUrl;
      })
      .catch((error) => {
        console.log('❌ validateWithModel ошибка:', error.message || error);
        throw error;
      });
  }

  addToModel(url) {
    console.log('➕ addToModel для url:', url);
    const feed = this.model.addFeed(url);
    console.log('✅ Фид добавлен в модель:', feed);
    return Promise.resolve(feed);
  }

  resetForm() {
    console.log('🧹 resetForm');
    return Promise.resolve(this.view.resetForm());
  }

  updateView() {
    console.log('🔄 updateView');
    const feeds = this.model.getFeeds();
    console.log('📋 Текущие фиды в модели:', feeds);

    this.view.updateFeeds(feeds); // ← обновляем через специальный метод

    console.log('✅ View обновлен');
  }

  runPipeline(initialValue, steps) {
    console.log('🚀 runPipeline запущен с initialValue:', initialValue);
    console.log(
      '📋 Шаги pipeline:',
      steps.map((step) => step.name || 'анонимная функция'),
    );

    return steps.reduce((promise, step, index) => {
      return promise.then((value) => {
        console.log(
          `⏩ Шаг ${index + 1}/${steps.length}: ${step.name || 'анонимная функция'}`,
        );
        console.log(`   Входное значение:`, value);
        return step.call(this, value);
      });
    }, Promise.resolve(initialValue));
  }
}
