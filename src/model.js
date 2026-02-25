import * as yup from 'yup';

const urlSchema = yup.string()
  .url('Please enter a valid URL (e.g., https://example.com/rss)')
  .required('URL cannot be empty');

export default class Model {
  constructor() {
    this.feeds = [];
  }
  
  validateUrl(url) {
    return urlSchema.validate(url);
  }
  
  isDuplicate(url) {
    return this.feeds.some(feed => feed.url === url);
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
}