import Model from '../../core/Model.js'

export default class PostsManager extends Model {
  constructor() {
    super({ posts: [] })
  }

  addPosts(newPosts) {
    const posts = [...this.state.posts, ...newPosts]
    this.setState({ posts })
    return newPosts
  }

  getPostsByFeedUrl(feedUrl) {
    return this.state.posts.filter((post) => post.feedUrl === feedUrl)
  }

  getPostById(id) {
    return this.state.posts.find((post) => post.id === id)
  }

  getAllPosts() {
    return this.state.posts
  }

  markAsRead(postId) {
    const posts = this.state.posts.map((post) =>
      post.id === postId ? { ...post, isRead: true } : post,
    )
    this.setState({ posts })
  }

  markMultipleAsRead(postIds) {
    const posts = this.state.posts.map((post) =>
      postIds.includes(post.id) ? { ...post, isRead: true } : post,
    )
    this.setState({ posts })
  }

  markFeedAsRead(feedUrl) {
    const posts = this.state.posts.map((post) =>
      post.feedUrl === feedUrl ? { ...post, isRead: true } : post,
    )
    this.setState({ posts })
  }

  removePostsByFeedUrl(feedUrl) {
    const posts = this.state.posts.filter((post) => post.feedUrl !== feedUrl)
    this.setState({ posts })
  }
}
