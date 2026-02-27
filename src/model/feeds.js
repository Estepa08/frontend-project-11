export default class FeedsManager {
  constructor() {
    this.feeds = [];
  }

  // Для обратной совместимости - добавление по URL
  addFeedByUrl(url) {
    const feed = {
      id: Date.now(),
      url,
      title: url, // временный заголовок
      description: '',
      addedAt: new Date().toLocaleString(),
      postCount: 0,
    };
    this.feeds.unshift(feed);
    return feed;
  }

  // Основной метод для добавления полного фида (из RSS)
  addFeed(feedData) {
    const feed = {
      id: Date.now(),
      ...feedData,
      addedAt: new Date().toLocaleString(),
    };
    this.feeds.unshift(feed);
    return feed;
  }

  // Обновляем существующий фид (например, после загрузки постов)
  updateFeed(feedId, updates) {
    const feed = this.feeds.find((f) => f.id === feedId);
    if (feed) {
      Object.assign(feed, updates);
    }
    return feed;
  }

  getFeeds() {
    return this.feeds;
  }

  getFeedById(id) {
    return this.feeds.find((feed) => feed.id === id);
  }

  getFeedByUrl(url) {
    return this.feeds.find((feed) => feed.url === url);
  }

  removeFeed(id) {
    this.feeds = this.feeds.filter((feed) => feed.id !== id);
    return id;
  }
}
