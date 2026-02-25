export default class View {
  constructor() {
    // Сохраняем ссылки на элементы
    this.form = document.getElementById('rss-form');
    this.input = this.form.querySelector('input');
    this.feedsContainer = document.getElementById('feeds');
  }
  
  // Получить URL из инпута
  getInputUrl() {
    return this.input.value.trim();
  }
  
  // Очистить инпут
  clearInput() {
    this.input.value = '';
  }
  
  // Показать ошибку
  showError(message) {
    this.input.classList.add('is-invalid');
    
    // Удаляем старую ошибку если есть
    const oldError = this.form.querySelector('.invalid-feedback');
    if (oldError) oldError.remove();
    
    const error = document.createElement('div');
    error.className = 'invalid-feedback';
    error.textContent = message;
    this.input.parentNode.appendChild(error);
  }
  
  // Очистить ошибку
  clearError() {
    this.input.classList.remove('is-invalid');
    const oldError = this.form.querySelector('.invalid-feedback');
    if (oldError) oldError.remove();
  }
  
  // Показать все фиды
  displayFeeds(feeds) {
    this.feedsContainer.innerHTML = '';
    
    feeds.forEach(feed => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'list-group-item list-group-item-action';
      item.dataset.id = feed.id;
      item.innerHTML = `
        <strong>${feed.url}</strong>
        <small class="text-muted float-end">${feed.addedAt}</small>
      `;
      this.feedsContainer.appendChild(item);
    });
  }
  
  // Привязать обработчик отправки формы
  bindAddFeed(handler) {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      handler();
    });
  }
  
  // Привязать обработчик клика по фиду
  bindFeedClick(handler) {
    this.feedsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.list-group-item');
      if (item) {
        e.preventDefault();
        handler(parseInt(item.dataset.id));
      }
    });
  }
}