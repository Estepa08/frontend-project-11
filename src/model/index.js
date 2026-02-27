import axios from 'axios';
import FeedsManager from './feeds.js';
import PostsManager from './posts.js';
import { validateUrl } from './validation.js';
import parseRss from './rssParser.js';

const apiClient = axios.create({
  baseURL: 'https://api.allorigins.win',
  timeout: 10000,
});

export default class Model {
  constructor() {
    this.feedsManager = new FeedsManager();
    this.postsManager = new PostsManager();
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
    return apiClient.get(`/raw?url=${encodedUrl}`)
      .then(response => response.data)
      .catch(error => {
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('errors.timeout'));
        }
        return Promise.reject(new Error('errors.network'));
      });
  }

  loadRss(url) {
    return this.validateUrl(url)
      .then(() => this.fetchRss(url))
      .then(xmlText => parseRss(xmlText, url))
      .then(({ feed, posts }) => {
        // Используем новый метод для полного фида
        const savedFeed = this.feedsManager.addFeed(feed);
        this.postsManager.addPosts(posts);
        return { feed: savedFeed, posts };
      });
  }
}