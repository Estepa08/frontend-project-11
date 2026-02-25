export default class View {
  constructor() {
    this.form = document.getElementById('rss-form');
    this.input = document.getElementById('rss-input');
    this.submitButton = this.form.querySelector('button');
    this.feedsContainer = document.getElementById('feeds');

    // Дополнительные слушатели
    this.initInputListener();
    this.initFeedClickListener();
  }

  // Слушатель на ввод текста
  initInputListener() {
    this.input.addEventListener('input', (e) => {
      console.log('✏️ Ввод:', e.target.value);
      // Можно сразу убирать красную рамку при вводе
      if (this.input.classList.contains('is-invalid')) {
        this.clearError();
      }
    });
  }

  // Слушатель на клик по фидам
  initFeedClickListener() {
    this.feedsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.list-group-item');
      if (item) {
        e.preventDefault();
        const id = item.dataset.id;
        console.log('🖱️ Клик по фиду:', id);

        // Создаем кастомное событие
        const event = new CustomEvent('feedClick', {
          detail: { id: parseInt(id) },
        });
        this.feedsContainer.dispatchEvent(event);
      }
    });
  }

  getInputValue() {
    return this.input.value.trim();
  }

  clearInput() {
    this.input.value = '';
  }

  focusInput() {
    this.input.focus();
  }

  showError(message) {
    console.log('🔴 showError ВЫЗВАН! message:', message);
    this.input.classList.add('is-invalid');

    const oldError = this.form.querySelector('.invalid-feedback');
    if (oldError) oldError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    this.input.parentNode.appendChild(errorDiv);
  }

  clearError() {
    this.input.classList.remove('is-invalid');
    const oldError = this.form.querySelector('.invalid-feedback');
    if (oldError) oldError.remove();
  }

  resetForm() {
    this.clearInput();
    this.clearError();
    this.focusInput();
  }

  displayFeeds(feeds) {
    this.feedsContainer.innerHTML = '';

    feeds.forEach((feed) => {
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

  bindSubmit(handler) {
    console.log('📌 bindSubmit: привязываю обработчик');

    this.submitButton.addEventListener('click', (e) => {
      console.log('✅ КЛИК ПО КНОПКЕ');
      e.preventDefault();

      // Игнорируем HTML5 валидацию, доверяем своей
      handler();
    });
  }
}
