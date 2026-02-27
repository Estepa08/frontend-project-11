import onChange from 'on-change';
import i18next from 'i18next';

export default class View {
  constructor() {
    this.form = document.getElementById('rss-form');
    this.input = document.getElementById('rss-input');
    this.submitButton = this.form.querySelector('button');
    this.feedsContainer = document.getElementById('feeds');
    this.appTitle = document.querySelector('h1');
    this.messagesContainer = document.getElementById('messages-container');

    // Устанавливаем начальные тексты
    this.setLanguageTexts();

    // Состояние View (реактивное!)
    this.state = onChange(
      {
        inputValue: '',
        errorCode: null,
        feeds: [],
        message: null,
        messageType: null,
      },
      () => {
        this.render();
      },
    );

    this.handlers = {
      submit: null,
      input: null,
      feedClick: null,
    };

    this.initEventListeners();
  }

  setLanguageTexts() {
    this.appTitle.textContent = i18next.t('appTitle');
    this.input.placeholder = i18next.t('form.placeholder');
    this.submitButton.textContent = i18next.t('form.addButton');
  }

  // Показать сообщение в messages-container
  showMessage(messageCode, type = 'info') {
    this.state.message = messageCode;
    this.state.messageType = type;

    // Автоматически очищаем сообщение через 3 секунды
    setTimeout(() => {
      if (this.state.message === messageCode) {
        this.state.message = null;
        this.state.messageType = null;
      }
    }, 3000);
  }

  // Для ошибок (с красной рамкой)
  showError(errorCode) {
    this.showMessage(errorCode, 'danger');
    this.input.classList.add('is-invalid');
  }

  clearError() {
    this.input.classList.remove('is-invalid');
  }

  // Для успеха
  showSuccess(messageCode) {
    this.showMessage(messageCode, 'success');
  }

  // Для информации
  showInfo(messageCode) {
    this.showMessage(messageCode, 'info');
  }

  initEventListeners() {
    this.submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (this.handlers.submit) {
        this.handlers.submit(this.state.inputValue);
      }
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      return false;
    });

    this.input.addEventListener('input', (e) => {
      this.state.inputValue = e.target.value;
      if (this.input.classList.contains('is-invalid')) {
        this.clearError();
      }
      this.handlers.input?.(e.target.value);
    });

    this.feedsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.list-group-item');
      if (item) {
        e.preventDefault();
        this.handlers.feedClick?.(parseInt(item.dataset.id));
      }
    });
  }

  on(event, handler) {
    if (Object.hasOwn(this.handlers, event)) {
      this.handlers[event] = handler;
    }
    return this;
  }

  getInputValue() {
    return this.state.inputValue;
  }

  clearInput() {
    this.state.inputValue = '';
    this.input.value = '';
  }

  focusInput() {
    this.input.focus();
  }

  resetForm() {
    this.clearInput();
    this.clearError();
    this.focusInput();
  }

  updateFeeds(feeds) {
    this.state.feeds = feeds;
  }

  render() {
    if (this.input.value !== this.state.inputValue) {
      this.input.value = this.state.inputValue;
    }

    // Показываем сообщение в messages-container
    this.renderMessage();

    // Отрисовываем фиды
    this.displayFeeds(this.state.feeds);
  }

  // Рендер сообщения в messages-container
  renderMessage() {
    if (!this.messagesContainer) return;

    if (this.state.message) {
      // Выбираем цвет в зависимости от типа
      const colorClass =
        this.state.messageType === 'danger'
          ? 'text-danger'
          : this.state.messageType === 'success'
            ? 'text-success'
            : 'text-info';

      // Добавляем эмодзи для наглядности
      const emoji =
        this.state.messageType === 'danger'
          ? '❌ '
          : this.state.messageType === 'success'
            ? '✅ '
            : 'ℹ️ ';

      this.messagesContainer.innerHTML = `
        <div class="${colorClass} mb-2">
          ${emoji}${i18next.t(this.state.message)}
        </div>
      `;
    } else {
      this.messagesContainer.innerHTML = '';
    }
  }

  displayFeeds(feeds) {
    this.feedsContainer.innerHTML = '';

    if (!feeds || feeds.length === 0) {
      return;
    }

    feeds.forEach((feed) => {
      const item = document.createElement('a');
      item.href = '#';
      item.className = 'list-group-item list-group-item-action feed-item';
      item.dataset.id = feed.id;

      // Красивое отображение фида
      item.innerHTML = `
      <div class="d-flex justify-content-between align-items-center">
        <div class="flex-grow-1">
          <div class="d-flex align-items-center mb-1">
            <i class="fas fa-rss text-warning me-2" style="font-size: 1.1rem;"></i>
            <span class="feed-title">${feed.title || feed.url}</span>
          </div>
          <div class="feed-meta ms-4">
            <i class="fas fa-calendar-alt me-1"></i>
            ${feed.addedAt}
            <i class="fas fa-file-text ms-3 me-1"></i>
            ${feed.postCount || 0} постов
          </div>
        </div>
        <div class="ms-3">
          <span class="badge bg-primary rounded-pill">
            <i class="fas fa-chevron-right"></i>
          </span>
        </div>
      </div>
    `;

      this.feedsContainer.appendChild(item);
    });
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'alert alert-info';
    emptyMessage.textContent = i18next.t('messages.noFeeds');
    this.feedsContainer.appendChild(emptyMessage);
  }
}
