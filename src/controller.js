export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    
    // Привязываем обработчики
    this.view.bindAddFeed(this.handleAddFeed.bind(this));
    this.view.bindFeedClick(this.handleFeedClick.bind(this));
    
    // Показываем существующие фиды (если есть)
    this.updateView();
  }
  
  handleAddFeed() {
    this.view.clearError();
    
    const url = this.view.getInputUrl();
    
    if (!url) {
      this.view.showError('URL cannot be empty');
      return;
    }
    
    if (!this.model.isValidUrl(url)) {
      this.view.showError('Please enter a valid URL');
      return;
    }
    
    this.model.addFeed(url);
    this.updateView();
    this.view.clearInput();
  }
  
  handleFeedClick(id) {
    // Например, удаляем фид по клику
    this.model.removeFeed(id);
    this.updateView();
  }
  
  updateView() {
    const feeds = this.model.getFeeds();
    this.view.displayFeeds(feeds);
  }
}