import * as yup from 'yup';
import i18next from 'i18next';

const urlSchema = yup
  .string()
  .required(() => i18next.t('errors.urlRequired'))
  .url(() => i18next.t('errors.urlInvalid'))
  .test(
    'not-duplicate',
    () => i18next.t('errors.duplicate'),
    function (url) {
      const feeds = this.options.context?.feeds || [];
      return !feeds.some((feed) => feed.url === url);
    },
  )
  .test(
    'is-rss',
    () => i18next.t('errors.notRss'),
    (url) => {
      return url.includes('rss') || url.includes('feed') || url.includes('xml');
    },
  );

export default class Model {
  constructor() {
    this.feeds = [];
  }

  validateUrl(url) {
    return urlSchema.validate(url, { context: { feeds: this.feeds } });
  }

  addFeed(url) {
    const feed = {
      id: Date.now(),
      url,
      addedAt: new Date().toLocaleString(),
    };
    this.feeds.unshift(feed);
    return feed;
  }

  getFeeds() {
    return this.feeds;
  }
}
