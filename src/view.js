import onChange from 'on-change';
import i18next from 'i18next';

export default class View {
  constructor() {
    this.form = document.getElementById('rss-form');
    this.input = document.getElementById('rss-input');
    this.submitButton = this.form.querySelector('button');
    this.feedsContainer = document.getElementById('feeds');
    this.postsContainer = document.getElementById('posts-container');
    this.messagesContainer = document.getElementById('messages-container');
    this.appTitle = document.querySelector('h1');

    // Получаем шаблоны
    this.feedTemplate = document.getElementById('feed-template');
    this.postTemplate = document.getElementById('post-template');
    this.postsHeaderTemplate = document.getElementById('posts-header-template');

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

  setLoading(isLoading) {
    console.log('⏳ setLoading:', isLoading);

    if (isLoading) {
      this.submitButton.disabled = true;
      this.submitButton.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Загрузка...';
    } else {
      this.submitButton.disabled = false;
      this.submitButton.innerHTML = i18next.t('form.addButton');
    }
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
    }, 5000);
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

    if (!feeds || feeds.length === 0) return;

    feeds.forEach((feed) => {
      const clone = this.feedTemplate.content.cloneNode(true);
      const item = clone.querySelector('a');

      // Заполняем данными
      item.dataset.id = feed.id;

      // ✅ Title
      const titleEl = item.querySelector('.feed-title');
      if (titleEl) titleEl.textContent = feed.title || feed.url;

      // ✅ DESCRIPTION (новый элемент!)
      const descEl = item.querySelector('.feed-description');
      if (descEl) {
        descEl.textContent = feed.description
          ? feed.description.length > 100
            ? feed.description.substring(0, 100) + '...'
            : feed.description
          : 'Нет описания';
      }

      // ✅ Date
      const dateEl = item.querySelector('.feed-date');
      if (dateEl) dateEl.textContent = feed.addedAt;

      // ✅ Post count
      const countEl = item.querySelector('.feed-posts-count');
      if (countEl) countEl.textContent = feed.postCount || 0;

      this.feedsContainer.appendChild(item);
    });
  }

  displayPosts(posts, feedTitle) {
    if (!posts || posts.length === 0) {
      this.postsContainer.style.display = 'none';
      return;
    }

    this.postsContainer.innerHTML = '';
    this.postsContainer.style.display = 'block';

    // Заголовок с названием фида
    const headerClone = this.postsHeaderTemplate.content.cloneNode(true);
    headerClone.querySelector('.feed-title').textContent = feedTitle;
    this.postsContainer.appendChild(headerClone);

    // Список постов
    const postsList = this.postsContainer.querySelector('.posts-list');

    posts.forEach((post) => {
      const postClone = this.postTemplate.content.cloneNode(true);
      const link = postClone.querySelector('a');

      link.href = post.link;
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');

      // ✅ НАЗВАНИЕ ПОСТА КАК ТЕКСТ ССЫЛКИ
      link.querySelector('.post-title').textContent = post.title;
      link.querySelector('.post-date').textContent = new Date(
        post.pubDate,
      ).toLocaleDateString();

      // Краткое описание (опционально)
      if (post.description) {
        link.querySelector('.post-description').textContent =
          post.description.substring(0, 150) + '...';
      }

      postsList.appendChild(link);
    });
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'alert alert-info';
    emptyMessage.textContent = i18next.t('messages.noFeeds');
    this.feedsContainer.appendChild(emptyMessage);
  }
}
