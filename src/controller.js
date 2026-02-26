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
    this.view.clearError();

    if (!url || url.trim() === '') {
      this.view.showError('errors.urlRequired');
      return;
    }

    const pipeline = [
      this.validateWithModel,
      this.addToModel,
      this.updateView.bind(this),
      this.resetForm,
    ];

    this.runPipeline(url, pipeline)
      .then(() => {
        this.view.showSuccess('messages.feedAdded');
      })
      .catch((error) => {
        this.view.showError(error.message);
      });
  }

  handleFeedClick() {
    // TODO: удаление фида
  }

  validateWithModel(url) {
    return this.model.validateUrl(url);
  }

  addToModel(url) {
    const feed = this.model.addFeed(url);
    return Promise.resolve(feed);
  }

  resetForm() {
    return Promise.resolve(this.view.resetForm());
  }

  updateView() {
    const feeds = this.model.getFeeds();
    this.view.updateFeeds(feeds);
  }

  runPipeline(initialValue, steps) {
    return steps.reduce((promise, step) => {
      return promise.then((value) => step.call(this, value));
    }, Promise.resolve(initialValue));
  }
}
