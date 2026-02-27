export default class PostsManager {
  constructor() {
    this.posts = [];
  }

  addPosts(posts) {
    this.posts.push(...posts);
    return posts;
  }

  getPosts(feedUrl = null) {
    if (feedUrl) {
      return this.posts.filter(post => post.feedUrl === feedUrl);
    }
    return this.posts;
  }
}