export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindSubmit(this.handleSubmit.bind(this));
    this.updateView();
  }

  // Главный метод с пайплайном
  handleSubmit() {
    console.log('1️⃣ handleSubmit');
    this.view.clearError();

    // Сначала получаем URL
    const url = this.view.getInputValue();

    // Потом используем
    console.log('3️⃣ URL из формы:', url);

    const pipeline = [
      this.checkNotEmpty,
      this.validateWithYup,
      this.checkDuplicate,
      this.addToModel,
      this.updateView.bind(this),
      this.resetForm,
    ];

    this.runPipeline(url, pipeline).catch((error) => {
      this.view.showError(error.message);
    });
  }

  // Универсальный запускатель пайплайна
  runPipeline(initialValue, steps) {
    return steps.reduce((promise, step) => {
      return promise.then((value) => step.call(this, value));
    }, Promise.resolve(initialValue));
  }

  checkNotEmpty(url) {
    if (!url || url.trim() === '') {
      return Promise.reject(new Error('URL cannot be empty'));
    }
    return Promise.resolve(url);
  }

  validateWithYup(url) {
    return this.model.validateUrl(url);
  }

  checkDuplicate(url) {
    if (this.model.isDuplicate(url)) {
      return Promise.reject(new Error('This RSS feed has already been added'));
    }
    return Promise.resolve(url);
  }

  addToModel(url) {
    return Promise.resolve(this.model.addFeed(url));
  }

  resetForm() {
    return Promise.resolve(this.view.resetForm());
  }

  updateView() {
    const feeds = this.model.getFeeds();
    this.view.displayFeeds(feeds);
  }
}
