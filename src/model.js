export default class Model {
  constructor() {
    this.feeds = [];
  }
  
  addFeed(url) {
    const feed = {
      id: Date.now(),
      url: url,
      addedAt: new Date().toLocaleString()
    };
    this.feeds.unshift(feed);
    return feed;
  }
  
  getFeeds() {
    return this.feeds;
  }
  
  removeFeed(id) {
    this.feeds = this.feeds.filter(feed => feed.id !== id);
  }
  
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}