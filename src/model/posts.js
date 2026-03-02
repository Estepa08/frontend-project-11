// model/posts.js
export default class PostsManager {
  constructor() {
    this.posts = [];
  }

  // Добавить посты (теперь с isRead = false)
  addPosts(newPosts) {
    const postsWithReadFlag = newPosts.map(post => ({
      ...post,
      isRead: false, // все новые посты непрочитанные
    }));
    this.posts.push(...postsWithReadFlag);
    return postsWithReadFlag;
  }

  // Получить посты для фида (с фильтром по прочитанности)
  getPostsByFeedUrl(feedUrl, filterByRead = null) {
    const posts = this.posts.filter(post => post.feedUrl === feedUrl);
    if (filterByRead !== null) {
      return posts.filter(post => post.isRead === filterByRead);
    }
    return posts;
  }

  // Получить все посты (с фильтром)
  getAllPosts(filterByRead = null) {
    if (filterByRead !== null) {
      return this.posts.filter(post => post.isRead === filterByRead);
    }
    return this.posts;
  }

  // Отметить пост как прочитанный
  markAsRead(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.isRead = true;
      return true;
    }
    return false;
  }

  // Отметить несколько постов как прочитанные
  markMultipleAsRead(postIds) {
    this.posts = this.posts.map(post => 
      postIds.includes(post.id) ? { ...post, isRead: true } : post
    );
    return postIds.length;
  }

  // Отметить все посты фида как прочитанные
  markFeedAsRead(feedUrl) {
    let count = 0;
    this.posts = this.posts.map(post => {
      if (post.feedUrl === feedUrl && !post.isRead) {
        count++;
        return { ...post, isRead: true };
      }
      return post;
    });
    return count;
  }

  // Получить статистику по фиду
  getFeedStats(feedUrl) {
    const feedPosts = this.getPostsByFeedUrl(feedUrl);
    const total = feedPosts.length;
    const unread = feedPosts.filter(p => !p.isRead).length;
    return { total, unread, read: total - unread };
  }

  // Удалить посты фида
  removePostsByFeedUrl(feedUrl) {
    this.posts = this.posts.filter(post => post.feedUrl !== feedUrl);
  }
}