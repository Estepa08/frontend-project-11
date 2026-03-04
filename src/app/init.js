import i18next from 'i18next'
import * as yup from 'yup'
import Controller from '../core/Controller.js'
import resources from '../locales/index.js'
import FeedsManager from '../modules/feeds/FeedsManager.js'
import FeedsView from '../modules/feeds/FeedsView.js'
import PostsManager from '../modules/posts/PostsManager.js'
import PostsView from '../modules/posts/PostsView.js'
import FormView from '../modules/ui/FormView.js'
import MessageView from '../modules/ui/MessageView.js'
import { fetchRss } from '../services/api.js'
import parseRss from '../services/rssParser.js'
import { validateUrl } from '../services/validator.js'
import config from './config.js'

const UPDATE_INTERVAL = 5000

class AppController extends Controller {
  constructor() {
    super(null, null)

    this.feedsManager = new FeedsManager()
    this.postsManager = new PostsManager()
    this.updateTimer = null
    this.isUpdating = false

    this.formView = new FormView(document.getElementById('rss-form'))
    this.feedsView = new FeedsView(
      document.getElementById('feeds'),
      document.getElementById('feed-template'),
    )
    this.postsView = new PostsView(
      document.getElementById('posts-container'),
      document.getElementById('post-template'),
    )
    this.messageView = new MessageView(document.getElementById('messages-container'))

    this.init()
    this.lastProxyError = null
  }

  init() {
    i18next
      .init({
        resources,
        lng: config.i18n.lng,
        interpolation: { escapeValue: false },
      })
      .then(() => {
        yup.setLocale({
          mixed: { required: () => i18next.t('errors.urlRequired') },
          string: { url: () => i18next.t('errors.urlInvalid') },
        })

        document.querySelectorAll('[data-i18n]').forEach((el) => {
          const key = el.dataset.i18n
          el.textContent = i18next.t(key)
        })

        this.formView.init()
        this.formView.onSubmit(this.handleSubmit.bind(this))

        if (this.postsView && typeof this.postsView.onPreviewClick === 'function') {
          this.postsView.onPreviewClick(this.handlePreview.bind(this))
        }

        this.feedsManager.subscribe((state) => {
          this.feedsView.render(state.feeds)
        })

        this.postsManager.subscribe(() => {
          const allPosts = this.postsManager.getAllPosts()
          this.postsView.render(allPosts)
        })

        this.updateView()
        this.startAutoUpdate()
      })
  }

  startAutoUpdate() {
    const update = () => {
      if (this.isUpdating) return

      this.isUpdating = true
      const feeds = this.feedsManager.getState().feeds

      const promises = feeds.map(feed => this.checkFeedUpdates(feed).catch(() => {}))

      Promise.all(promises).finally(() => {
        this.isUpdating = false
        this.updateTimer = setTimeout(update, UPDATE_INTERVAL)
      })
    }

    this.updateTimer = setTimeout(update, UPDATE_INTERVAL)
  }

  checkFeedUpdates(feed) {
    return fetchRss(feed.url)
      .then(xmlText => parseRss(xmlText, feed.url))
      .then((data) => {
        const existingPosts = this.postsManager.getPostsByFeedUrl(feed.url)
        const newPosts = data.posts.filter(
          newPost => !existingPosts.some(existing => existing.title === newPost.title),
        )

        if (newPosts.length > 0) {
          this.postsManager.addPosts(newPosts.map(post => ({ ...post, feedUrl: feed.url })))

          this.feedsManager.updateFeed(feed.id, {
            postCount: (feed.postCount || 0) + newPosts.length,
          })

          this.messageView.show(`📢 ${newPosts.length} новых постов`, 'info')
        }
      })
      .catch((error) => {
        if (!this.lastProxyError || Date.now() - this.lastProxyError > 60000) {
          if (error.message === 'errors.proxyUnavailable') {
            this.messageView.show('errors.proxyUnavailable', 'warning')
          }
          else if (error.message === 'errors.tooManyRequests') {
            this.messageView.show('errors.tooManyRequests', 'warning')
          }
          else {
            this.messageView.show(error.message || 'errors.network', 'danger')
          }
          this.lastProxyError = Date.now()
        }
      })
  }

  handleSubmit(url) {
    console.log('🚀🚀🚀 HANDLE SUBMIT ВЫЗВАН, URL:', url)
    console.log('🚀 ЭТОТ ЛОГ ДОЛЖЕН БЫТЬ ВИДЕН В ТЕСТАХ!')
    console.log('🔥 handleSubmit START, url:', url)
    console.log('🔥 formView exists:', !!this.formView)
    console.log('🔥 messageView exists:', !!this.messageView)

    this.formView.clearError()
    this.formView.setLoading(true)

    if (!url || url.trim() === '') {
      console.log('🔥 URL пустой')
      this.formView.setLoading(false)
      this.messageView.show('errors.urlRequired', 'danger')
      this.formView.showError()
      return
    }

    console.log('🔥 Валидация...')
    validateUrl(url, this.feedsManager.getState().feeds)
      .then(() => {
        console.log('🔥 Валидация прошла')
        return fetchRss(url)
      })
      .then((xmlText) => {
        console.log('🔥 RSS загружен, длина:', xmlText.length)
        return parseRss(xmlText, url)
      })
      .then(({ feed, posts }) => {
        console.log('🔥 RSS распарсен, постов:', posts.length)
        this.feedsManager.addFeed(feed)
        this.postsManager.addPosts(posts)
        this.messageView.show('messages.feedAdded', 'success')
        this.formView.clear()
        this.formView.focus()
      })
      .catch((error) => {
        console.log('🔥 ОШИБКА В HANDLE SUBMIT')
        console.log('🔥 error:', error)
        console.log('🔥 error.message:', error.message)

        if (error.message?.startsWith('errors.')) {
          console.log('🔥 Показываем ошибку:', error.message)
          this.messageView.show(error.message, 'danger')
        }
        else {
          console.log('🔥 Показываем unknown')
          this.messageView.show('errors.unknown', 'danger')
        }
      })
      .finally(() => {
        console.log('🔥 finally, убираем загрузку')
        this.formView.setLoading(false)
      })
  }

  handlePreview(postId) {
    const post = this.postsManager.getPostById(postId)

    if (!post) {
      return
    }

    this.postsManager.markAsRead(postId)
    this.postsView.showPreview(post)
  }

  updateView() {
    const feeds = this.feedsManager.getState().feeds
    this.feedsView.render(feeds)
  }
}

export const initApp = () => {
  document.addEventListener('DOMContentLoaded', () => {
    const app = new AppController() // сохраняем в переменную
    console.log('App initialized', app) // используем
  })
}
