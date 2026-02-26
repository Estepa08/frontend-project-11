import * as yup from 'yup';

const urlSchema = yup.string()
  .required('URL cannot be empty')
  .url('Please enter a valid URL')
  .test('not-duplicate', 'This RSS feed already exists', function(url) {
    const feeds = this.options.context?.feeds || [];
    return !feeds.some(feed => feed.url === url);
  });

export default class Model {
  constructor() {
    this.feeds = [];
  }
  
  // ЕДИНСТВЕННЫЙ метод валидации
  validateUrl(url) {
    return urlSchema.validate(url, { context: { feeds: this.feeds } });
  }
  
  addFeed(url) {
    const feed = {
      id: Date.now(),
      url,
      addedAt: new Date().toLocaleString()
    };
    this.feeds.unshift(feed);
    return feed;
  }
  
  getFeeds() { return this.feeds; }
}