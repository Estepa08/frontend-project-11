import axios from 'axios';
import FeedsManager from './feeds.js';
import PostsManager from './posts.js';
import { validateUrl } from './validation.js';
import parseRss from './rssParser.js';
console.log('📦 parseRss загружен:', typeof parseRss);

const apiClient = axios.create({
  baseURL: 'https://api.allorigins.win',
  timeout: 10000,
});

export default class Model {
  constructor() {
    this.feedsManager = new FeedsManager();
    this.postsManager = new PostsManager();
  }

  parseRss(xmlText, url) {
    this.currentUrl = url;
    return parseRss(xmlText, url); // ← просто вызываем импортированную функцию
  }
  // ✅ Старое название метода для совместимости
  addFeed(url) {
    return this.feedsManager.addFeedByUrl(url);
  }

  // ✅ Новый метод для полных фидов
  addFullFeed(feedData) {
    return this.feedsManager.addFeed(feedData);
  }

  getFeeds() {
    return this.feedsManager.getFeeds();
  }

  getPosts(feedUrl) {
    return this.postsManager.getPosts(feedUrl);
  }

  validateUrl(url) {
    return validateUrl(url, this.feedsManager.getFeeds());
  }

  fetchRss(url) {
    const encodedUrl = encodeURIComponent(url);
    return apiClient
      .get(`/raw?url=${encodedUrl}`)
      .then((response) => response.data)
      .catch((error) => {
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('errors.timeout'));
        }
        return Promise.reject(new Error('errors.network'));
      });
  }

  // Для тестирования
  //   fetchRss(url) {
  //     console.log('📡 fetchRss для:', url);

  //     // Просто загружаем напрямую (без прокси)
  //     return fetch(url)
  //       .then((response) => {
  //         if (!response.ok) {
  //           throw new Error(`HTTP error! status: ${response.status}`);
  //         }
  //         return response.text();
  //       })
  //       .then((xml) => {
  //         console.log('✅ Файл загружен, длина:', xml.length);
  //         return xml;
  //       })
  //       .catch((error) => {
  //         console.error('❌ Ошибка загрузки:', error);
  //         return Promise.reject(new Error('errors.network'));
  //       });
  //   }

  // Для тестирования
  //   fetchRss(url) {
  //     // Временно используем axios с таймаутом
  //     return apiClient
  //       .get('/raw?url=' + encodeURIComponent(url))
  //       .then((response) => response.data)
  //       .catch((error) => {
  //         if (error.code === 'ECONNABORTED') {
  //           return Promise.reject(new Error('errors.timeout'));
  //         }
  //         return Promise.reject(new Error('errors.network'));
  //       });
  //   }

  loadRss(url) {
    console.log('1️⃣ loadRss начат для:', url);

    return this.validateUrl(url)
      .then(() => {
        console.log('2️⃣ Валидация пройдена');
        return this.fetchRss(url);
      })
      .then((xmlText) => {
        console.log('3️⃣ RSS загружен, длина:', xmlText?.length);
        console.log('4️⃣ Вызываем parseRss...');

        // Добавь проверку
        if (typeof parseRss !== 'function') {
          console.error('❌ parseRss не функция!');
          throw new Error('Internal error');
        }

        return parseRss(xmlText, url);
      })
      .then(({ feed, posts }) => {
        console.log('5️⃣ Парсинг успешен:', { feed, postsCount: posts.length });

        const savedFeed = this.feedsManager.addFeed(feed);
        this.postsManager.addPosts(posts);

        console.log('6️⃣ Данные сохранены');
        return { feed: savedFeed, posts };
      })
      .catch((error) => {
        console.error('❌ Ошибка в loadRss:', error);
        throw error;
      });
  }
}
