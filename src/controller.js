import parseRss from './model/rssParser.js';

export default class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    // Переменные для автообновления
    this.updateTimer = null;
    this.isUpdating = false;
    this.UPDATE_INTERVAL = 2000; // 5 секунд

    this.view
      .on('submit', this.handleSubmit.bind(this))
      .on('feedClick', this.handleFeedClick.bind(this));

    this.updateView();
    this.startAutoUpdate();
  }

  // ===== АВТООБНОВЛЕНИЕ =====

  // Запуск цикла проверки
  startAutoUpdate() {
    console.log('🚀 startAutoUpdate вызван!');
    console.log('📊 Текущие фиды в модели:', this.model.getFeeds().length);

    const update = async () => {
      console.log(
        '🔄 Цикл обновления запущен, время:',
        new Date().toLocaleTimeString(),
      );
      console.log('📊 Фидов для проверки:', this.model.getFeeds().length);

      if (this.isUpdating) {
        console.log('⏭️ Пропускаем, уже идет обновление');
        return;
      }

      this.isUpdating = true;
      console.log('🔄 Начинаем проверку фидов...');

      const feeds = this.model.getFeeds();
      console.log('📋 Найдено фидов:', feeds.length);

      if (feeds.length === 0) {
        console.log('⚠️ Нет фидов для проверки');
      }

      for (const feed of feeds) {
        try {
          await this.checkFeedUpdates(feed);
        } catch (error) {
          console.error(`Ошибка обновления ${feed.url}:`, error);
        }
      }

      this.isUpdating = false;
      this.updateTimer = setTimeout(update, this.UPDATE_INTERVAL);
      console.log('⏱️ Следующая проверка через', this.UPDATE_INTERVAL, 'мс');
    };

    // Запускаем первую проверку через 5 секунд
    this.updateTimer = setTimeout(update, this.UPDATE_INTERVAL);
    console.log(
      '✅ Первая проверка запланирована через',
      this.UPDATE_INTERVAL,
      'мс',
    );
  }

  // Проверка одного фида
  async checkFeedUpdates(feed) {
    console.log(
      `%c🕒 ТЕСТ: checkFeedUpdates запущен для ${feed.url} в ${new Date().toLocaleTimeString()}`,
      'background: purple; color: white; font-size: 12px',
    );
    console.log(`🔄 Проверка обновлений для: ${feed.url}`);

    // Загружаем свежие данные
    const xmlText = await this.model.fetchRss(feed.url);
    const data = parseRss(xmlText, feed.url);

    // Получаем существующие посты
    const existingPosts = this.model.postsManager.getPostsByFeedUrl(feed.url);

    // Находим новые
    const newPosts = data.posts.filter(
      (newPost) =>
        !existingPosts.some((existing) => existing.title === newPost.title),
    );

    if (newPosts.length > 0) {
      console.log(`✅ Найдено ${newPosts.length} новых постов`);

      // Добавляем новые посты
      this.model.postsManager.addPosts(
        newPosts.map((post) => ({
          ...post,
          feedUrl: feed.url,
        })),
      );

      // Обновляем счетчик в фиде
      this.model.feedsManager.updateFeed(feed.id, {
        postCount: (feed.postCount || 0) + newPosts.length,
      });

      // Показываем уведомление
      this.view.showInfo(`📢 ${newPosts.length} новых постов`);

      // Обновляем отображение
      this.updateView();
    }

    if (newPosts.length > 0) {
      console.log(
        `%c🔥 ТЕСТ: Найдено ${newPosts.length} новых постов для "${feed.title}"`,
        'background: green; color: white; font-size: 12px',
      );
    } else {
      console.log(
        `%c💤 ТЕСТ: Новых постов для "${feed.title}" нет`,
        'background: blue; color: white; font-size: 12px',
      );
    }
  }

  // ===== ОСТАЛЬНЫЕ МЕТОДЫ =====

  handleSubmit(url) {
    this.view.clearFormError();
    this.view.setLoading(true);

    if (!url || url.trim() === '') {
      this.view.setFormError('errors.urlRequired');
      this.view.setLoading(false);
      return;
    }

    const pipeline = [
      this.validateUrl,
      this.fetchRss,
      this.parseRss,
      this.saveRssData,
      this.updateView.bind(this),
      this.showSuccess,
      this.resetForm,
    ];

    this.runPipeline(url, pipeline)
      .catch((error) => {
        console.log('🔥 Ошибка в pipeline:', error);

        if (
          error.message === 'errors.network' ||
          error.message === 'errors.timeout' ||
          error.message === 'errors.invalidRss'
        ) {
          this.view.setNetworkError(error.message);
        } else {
          this.view.setNetworkError('errors.unknown');
        }
      })
      .finally(() => {
        this.view.setLoading(false);
      });
  }

  validateUrl(url) {
    console.log('🔍 Шаг 1: Валидация URL');
    return this.model.validateUrl(url);
  }

  fetchRss(url) {
    console.log('📡 Шаг 2: Загрузка RSS');
    this.currentUrl = url;
    return this.model.fetchRss(url);
  }

  parseRss(xmlText) {
    console.log('🔄 Шаг 3: Парсинг RSS');
    return this.model.parseRss(xmlText, this.currentUrl);
  }

  saveRssData({ feed, posts }) {
    console.log('💾 Шаг 4: Сохранение данных');
    this.model.feedsManager.addFeed(feed);
    this.model.postsManager.addPosts(posts);
    return Promise.resolve({ feed, posts });
  }

  showSuccess() {
    console.log('✅ Шаг 5: Показ успеха');
    this.view.showSuccess('messages.feedAdded');
    return Promise.resolve();
  }

  resetForm() {
    console.log('🧹 Шаг 6: Очистка формы');
    return Promise.resolve(this.view.resetForm());
  }

  handleFeedClick(id) {
    const feed = this.model.feedsManager.getFeedById(id);
    if (!feed) return;

    const posts = this.model.postsManager.getPostsByFeedUrl(feed.url);
    this.view.togglePosts(posts, feed.title, feed.id);
  }

  updateView() {
    const feeds = this.model.getFeeds();
    this.view.updateFeeds(feeds);
  }

  runPipeline(initialValue, steps) {
    console.log('🚀 Запуск pipeline');
    return steps.reduce((promise, step) => {
      return promise.then((value) => step.call(this, value));
    }, Promise.resolve(initialValue));
  }
}
