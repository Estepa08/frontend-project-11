import Model from '../../core/Model.js'

export default class FeedsManager extends Model {
  constructor() {
    super({ feeds: [] })
  }

  addFeed(feedData) {
    const feeds = [feedData, ...this.state.feeds]
    this.setState({ feeds })
    return feedData
  }

  removeFeed(id) {
    const feeds = this.state.feeds.filter((feed) => feed.id !== id)
    this.setState({ feeds })
  }

  getFeedById(id) {
    return this.state.feeds.find((feed) => feed.id === id)
  }

  getFeedByUrl(url) {
    return this.state.feeds.find((feed) => feed.url === url)
  }

  updateFeed(id, updatedData) {
    const feeds = this.state.feeds.map((feed) =>
      feed.id === id ? { ...feed, ...updatedData } : feed,
    )
    this.setState({ feeds })
  }

  updatePostCount(feedId, count) {
    const feeds = this.state.feeds.map((feed) =>
      feed.id === feedId ? { ...feed, postCount: count } : feed,
    )
    this.setState({ feeds })
  }
}
