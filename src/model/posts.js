// model/posts.js
export default class PostsManager {
  constructor() {
    this.posts = [];
  }

  // Добавить посты
  addPosts(newPosts) {
    this.posts.push(...newPosts);
    return newPosts;
  }

  // Получить посты для фида
  getPostsByFeedUrl(feedUrl) {
    return this.posts.filter(post => post.feedUrl === feedUrl);
  }

  // Получить все посты
  getAllPosts() {
    return this.posts;
  }

  // Удалить посты фида
  removePostsByFeedUrl(feedUrl) {
    this.posts = this.posts.filter(post => post.feedUrl !== feedUrl);
  }
}