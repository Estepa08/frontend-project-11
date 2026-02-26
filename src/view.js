import onChange from 'on-change';

export default class View {
  constructor() {
    this.form = document.getElementById('rss-form');
    this.input = document.getElementById('rss-input');
    this.submitButton = this.form.querySelector('button');
    this.feedsContainer = document.getElementById('feeds');

    // Состояние View (реактивное!)
    this.state = onChange(
      { inputValue: '', error: null, feeds: [] },
      (path, value) => {
        // ← убрали previousValue
        console.log(`📊 Состояние изменилось: ${path} =`, value);
        this.render();
      },
    );

    // Хранилище для обработчиков событий
    this.handlers = {
      submit: null,
      input: null,
      feedClick: null,
    };

    this.initEventListeners();
  }

  initEventListeners() {
    // Кнопка
    this.submitButton.addEventListener('click', (e) => {
      console.log('🔥 КНОПКА НАЖАТА!');
      e.preventDefault();
      e.stopPropagation();
      if (this.handlers.submit) {
        this.handlers.submit(this.state.inputValue);
      }
    });

    // Форма (на всякий случай)
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      return false;
    });

    // Инпут - обновляем состояние!
    this.input.addEventListener('input', (e) => {
      this.state.inputValue = e.target.value; // ← onChange поймает изменение!
      if (this.input.classList.contains('is-invalid')) {
        this.clearError();
      }
      this.handlers.input?.(e.target.value);
    });

    // Клики по фидам
    this.feedsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.list-group-item');
      if (item) {
        e.preventDefault();
        this.handlers.feedClick?.(parseInt(item.dataset.id));
      }
    });
  }

  // Единый метод подписки
  on(event, handler) {
    if (Object.hasOwn(this.handlers, event)) {
      // ✅ правильно
      console.log(`📌 Подписка на событие: ${event}`);
      this.handlers[event] = handler;
    }
    return this;
  }

  // Геттер для значения (теперь берем из состояния)
  getInputValue() {
    return this.state.inputValue;
  }

  // Сеттер для значения (обновляет состояние)
  setInputValue(value) {
    this.state.inputValue = value;
  }

  clearInput() {
    this.setInputValue(''); // Через состояние!
    this.input.value = ''; // Синхронизируем DOM
  }

  focusInput() {
    this.input.focus();
  }

  showError(message) {
    console.log('🔴 showError:', message);
    this.state.error = message; // Сохраняем в состояние
    this.input.classList.add('is-invalid');

    const oldError = this.form.querySelector('.invalid-feedback');
    if (oldError) oldError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'invalid-feedback';
    errorDiv.textContent = message;
    this.input.parentNode.appendChild(errorDiv);
  }

  clearError() {
    console.log('🟢 clearError');
    this.state.error = null; // Очищаем состояние
    this.input.classList.remove('is-invalid');
    const oldError = this.form.querySelector('.invalid-feedback');
    if (oldError) oldError.remove();
  }

  showEmptyMessage() {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'alert alert-info';
    emptyMessage.textContent = 'No feeds yet. Add your first RSS URL!';
    this.feedsContainer.appendChild(emptyMessage);
  }

  resetForm() {
    this.clearInput();
    this.clearError();
    this.focusInput();
  }

  updateFeeds(feeds) {
    console.log('📝 updateFeeds с массивом:', feeds);
    this.state.feeds = feeds; // ← onChange поймает и вызовет render()
  }

  // Рендер всего UI на основе состояния
  render() {
    console.log('🔄 Рендер View с состоянием:', this.state);

    // Обновляем значение инпута если нужно
    if (this.input.value !== this.state.inputValue) {
      this.input.value = this.state.inputValue;
    }

    // Отрисовываем фиды
    this.displayFeeds(this.state.feeds);
  }

  // Обновление списка фидов
  displayFeeds(feeds) {
    console.log('🖼️ displayFeeds начал работу с массивом:', feeds);
    this.feedsContainer.innerHTML = ''; // 1. Очищаем

    if (!feeds || feeds.length === 0) {
      console.log('🖼️ Массив пуст, показываем заглушку.');
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'alert alert-info';
      emptyMessage.textContent = 'No feeds yet. Add your first RSS URL!';
      this.feedsContainer.appendChild(emptyMessage);
      return; // ← Выходим только если фидов нет!
    }

    console.log(`🖼️ Создаю ${feeds.length} элементов...`);
    feeds.forEach((feed) => {
      const item = document.createElement('a');
      item.href = '#'; // Добавь href, если нужно
      item.className = 'list-group-item list-group-item-action';
      item.dataset.id = feed.id;
      item.innerHTML = `
      <strong>${feed.url}</strong>
      <small class="text-muted float-end">${feed.addedAt}</small>
    `;
      this.feedsContainer.appendChild(item);
      console.log('   Элемент добавлен в DOM для URL:', feed.url);
    });

    console.log(
      '🖼️ displayFeeds завершен. Теперь в контейнере элементов:',
      this.feedsContainer.children.length,
    );
  }

  // Приватный метод для реальной отрисовки
}
