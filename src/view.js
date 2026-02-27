import onChange from 'on-change';
import i18next from 'i18next';

const MESSAGE_DISPLAY_TIME = 5000;
const MESSAGE_CONFIG = {
  danger: { color: 'text-danger', emoji: '❌ ' },
  success: { color: 'text-success', emoji: '✅ ' },
  info: { color: 'text-info', emoji: 'ℹ️ ' },
};

export default class View {
  constructor() {
    this.form = document.getElementById('rss-form');
    this.input = document.getElementById('rss-input');
    this.submitButton = this.form.querySelector('button');
    this.feedsContainer = document.getElementById('feeds');
    this.postsContainer = document.getElementById('posts-container');
    this.messagesContainer = document.getElementById('messages-container');
    this.appTitle = document.querySelector('h1');

    this.feedTemplate = document.getElementById('feed-template');
    this.postTemplate = document.getElementById('post-template');
    this.postsHeaderTemplate = document.getElementById('posts-header-template');

    this.setLanguageTexts();

    // Новое состояние с разделением
    this.state = onChange(
      {
        inputValue: '',
        feeds: [],

        // Состояние формы (валидация)
        form: {
          isValid: true,
          error: null, // errors.urlRequired, errors.urlInvalid, errors.duplicate
        },

        // Состояние сети
        network: {
          status: 'idle', // 'idle', 'loading', 'success', 'error'
          error: null, // errors.timeout, errors.network, errors.invalidRss
        },

        // Общее сообщение для UI
        message: null,
        messageType: null,
      },
      () => this.render(),
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

  // ===== УПРАВЛЕНИЕ ФОРМОЙ =====

  // Ошибки валидации (до отправки)
  setFormError(errorCode) {
    this.state.form.isValid = false;
    this.state.form.error = errorCode;
    this.state.message = errorCode;
    this.state.messageType = 'danger';
    this.input.classList.add('is-invalid');
  }

  clearFormError() {
    this.state.form.isValid = true;
    this.state.form.error = null;
    this.input.classList.remove('is-invalid');
  }

  // ===== УПРАВЛЕНИЕ СЕТЬЮ =====

  setLoading(isLoading) {
    this.state.network.status = isLoading ? 'loading' : 'idle';

    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Загрузка...';
    } else {
      this.submitButton.disabled = false;
      this.submitButton.innerHTML = i18next.t('form.addButton');
    }
  }

  // Ошибки сети/сервера (после отправки)
  setNetworkError(errorCode) {
    this.state.network.status = 'error';
    this.state.network.error = errorCode;
    this.showMessage(errorCode, 'danger');
  }

  setNetworkSuccess() {
    this.state.network.status = 'success';
    this.state.network.error = null;
    this.showMessage('messages.feedAdded', 'success');
  }

  // ===== ОБЩИЕ СООБЩЕНИЯ =====

  showMessage(messageCode, type = 'info') {
    this.state.message = messageCode;
    this.state.messageType = type;

    setTimeout(() => {
      if (this.state.message === messageCode) {
        this.state.message = null;
        this.state.messageType = null;
      }
    }, MESSAGE_DISPLAY_TIME);
  }

  // Для обратной совместимости
  showError(errorCode) {
    this.setFormError(errorCode);
  }

  showSuccess(messageCode) {
    this.setNetworkSuccess();
    this.showMessage(messageCode, 'success');
  }

  // ===== ОБРАБОТЧИКИ =====

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
      if (!this.state.form.isValid) {
        this.clearFormError();
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

  // ===== РАБОТА С ФОРМОЙ =====

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
    this.clearFormError();
    this.focusInput();
  }

  // ===== ОБНОВЛЕНИЕ ДАННЫХ =====

  updateFeeds(feeds) {
    this.state.feeds = feeds;
  }

  // ===== ОТРИСОВКА =====

  render() {
    if (this.input.value !== this.state.inputValue) {
      this.input.value = this.state.inputValue;
    }

    this.renderMessage();
    this.displayFeeds(this.state.feeds);
  }

  renderMessage() {
    if (!this.messagesContainer) return;

    if (this.state.message) {
      const config =
        MESSAGE_CONFIG[this.state.messageType] || MESSAGE_CONFIG.info;
      this.messagesContainer.innerHTML = `
        <div class="${config.color} mb-2">
          ${config.emoji}${i18next.t(this.state.message)}
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
      const clone = this.feedTemplate.content.cloneNode(true);
      const item = clone.querySelector('a');
      item.dataset.id = feed.id;

      this.setFeedTitle(item, feed);
      this.setFeedDescription(item, feed);
      this.setFeedMeta(item, feed);

      this.feedsContainer.appendChild(item);
    });
  }

  setFeedTitle(item, feed) {
    const titleEl = item.querySelector('.feed-title');
    if (titleEl) titleEl.textContent = feed.title || feed.url;
  }

  setFeedDescription(item, feed) {
    const descEl = item.querySelector('.feed-description');
    if (!descEl) return;

    if (!feed.description) {
      descEl.textContent = 'Нет описания';
      return;
    }

    descEl.textContent =
      feed.description.length > 100
        ? feed.description.substring(0, 100) + '...'
        : feed.description;
  }

  setFeedMeta(item, feed) {
    const dateEl = item.querySelector('.feed-date');
    if (dateEl) dateEl.textContent = feed.addedAt;

    const countEl = item.querySelector('.feed-posts-count');
    if (countEl) countEl.textContent = feed.postCount || 0;
  }

  displayPosts(posts, feedTitle) {
    if (!posts || posts.length === 0) {
      this.postsContainer.style.display = 'none';
      return;
    }

    this.postsContainer.innerHTML = '';
    this.postsContainer.style.display = 'block';

    const headerClone = this.postsHeaderTemplate.content.cloneNode(true);
    headerClone.querySelector('.feed-title').textContent = feedTitle;
    this.postsContainer.appendChild(headerClone);

    const postsList = this.postsContainer.querySelector('.posts-list');
    posts.forEach((post) => this.renderPost(post, postsList));
  }

  renderPost(post, container) {
    const postClone = this.postTemplate.content.cloneNode(true);
    const link = postClone.querySelector('a');

    link.href = post.link;
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');

    link.querySelector('.post-title').textContent = post.title;
    link.querySelector('.post-date').textContent = new Date(
      post.pubDate,
    ).toLocaleDateString();

    if (post.description) {
      link.querySelector('.post-description').textContent =
        post.description.substring(0, 150) + '...';
    }

    container.appendChild(link);
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'alert alert-info';
    emptyMessage.textContent = i18next.t('messages.noFeeds');
    this.feedsContainer.appendChild(emptyMessage);
  }
}
