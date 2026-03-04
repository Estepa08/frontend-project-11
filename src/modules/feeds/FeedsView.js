import i18next from 'i18next'
import View from '../../core/View.js'
import { MAX_DESCRIPTION_LENGTH } from '../../utils/constants.js'

const truncate = (text, maxLength) => {
  if (!text) return 'Нет описания'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export default class FeedsView extends View {
  constructor(container, template) {
    super(container, { template })
  }

  onFeedClick(handler) {
    this.on('click', '.feed-item', (e) => {
      const item = e.target.closest('.feed-item')
      const id = item?.dataset?.id
      if (id && handler) {
        handler(parseInt(id))
      }
    })
  }

  render(feeds) {
    this.clear()

    if (!feeds || feeds.length === 0) {
      return
    }

    feeds.forEach((feed) => {
      const clone = this.template.content.cloneNode(true)
      const item = clone.querySelector('a')
      const countEl = item.querySelector('.feed-posts-count')
      const count = feed.postCount || 0

      item.dataset.id = feed.id

      const oldTitle = item.querySelector('.feed-title')
      if (oldTitle) {
        oldTitle.remove()
      }

      const titleEl = document.createElement('h3')
      titleEl.className = 'feed-title h5 mb-1'
      titleEl.textContent = feed.title || feed.url

      const container = item.querySelector('.d-flex.align-items-center.mb-1')
      if (container) {
        container.appendChild(titleEl)
      }

      item.querySelector('.feed-description').textContent = truncate(
        feed.description,
        MAX_DESCRIPTION_LENGTH,
      )
      item.querySelector('.feed-date').textContent = feed.addedAt
      countEl.textContent = i18next.t('feeds.postsCount', { count })

      this.container.appendChild(clone)
    })
  }

  showEmpty() {
    this.container.innerHTML = `
      <div class="alert alert-info">
        ${i18next.t('messages.noFeeds')}
      </div>
    `
  }
}
