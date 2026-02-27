import axios from 'axios';
import FeedsManager from './feeds.js';
import PostsManager from './posts.js';
import { validateUrl } from './validation.js';
import parseRss from './rssParser.js';
console.log('📦 parseRss загружен:', typeof parseRss);

const apiClient = axios.create({
  baseURL: 'https://allorigins.hexlet.app',
  timeout: 15000,
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
    console.log('📡 fetchRss для:', url);

    const encodedUrl = encodeURIComponent(url);

    return apiClient
      .get(`/raw?url=${encodedUrl}&disableCache=true`)
      .then((response) => {
        console.log('✅ RSS загружен через прокси');
        console.log('📋 Тип ответа:', typeof response.data);

        // Если ответ - объект, а не строка, значит прокси вернул ошибку
        if (typeof response.data !== 'string') {
          console.log('❌ Прокси вернул объект с ошибкой:', response.data);
          return Promise.reject(new Error('errors.network'));
        }

        // Проверяем, что ответ похож на XML
        const data = response.data;

        // Проверка на HTML-страницу с ошибкой
        if (data.includes('<!DOCTYPE html>') || data.includes('<html>')) {
          console.log('❌ Прокси вернул HTML страницу');
          return Promise.reject(new Error('errors.network'));
        }

        // Проверка на сообщения об ошибках
        if (
          data.includes('404 Not Found') ||
          data.includes('502 Bad Gateway') ||
          data.includes('504 Gateway Timeout')
        ) {
          console.log('❌ Прокси вернул HTTP ошибку');
          return Promise.reject(new Error('errors.network'));
        }

        return data;
      })
      .catch((error) => {
        console.log(
          '🔥 Начало обработки ошибки в fetchRss. Тип error:',
          typeof error,
        );

        // Если мы уже создали и выбросили свою ошибку в then
        if (error instanceof Error && error.message === 'errors.network') {
          console.log('✅ Пробрасываем errors.network дальше');
          return Promise.reject(error);
        }

        // Обработка ошибок axios
        console.log('🔥 error.code:', error.code);
        console.log('🔥 error.message:', error.message);

        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('errors.timeout'));
        }

        if (error.code === 'ENOTFOUND' || error.code === 'EAI_AGAIN') {
          return Promise.reject(new Error('errors.network'));
        }

        if (error.response) {
          console.log(
            '❌ Прокси вернул ответ с ошибкой, статус:',
            error.response.status,
          );
          return Promise.reject(new Error('errors.network'));
        }

        if (error.request) {
          console.log('❌ Запрос был сделан, но нет ответа');
          return Promise.reject(new Error('errors.network'));
        }

        // Если ничего не подошло
        console.log('❌ Неизвестная ошибка axios:', error.message);
        return Promise.reject(new Error('errors.unknown'));
      });
  }

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
