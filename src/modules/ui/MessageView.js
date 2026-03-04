import i18next from 'i18next'
import View from '../../core/View.js'
import { MESSAGE_DISPLAY_TIME } from '../../utils/constants.js'

const MESSAGE_CONFIG = {
  danger: 'text-danger',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
}

const EMOJI = {
  danger: '❌ ',
  success: '✅ ',
  info: 'ℹ️ ',
  warning: '⚠️ ',
}

export default class MessageView extends View {
  constructor(container) {
    super(container)
    this.timeout = null
  }

  show(messageCode, type = 'info') {
    this.clear()

    const colorClass = MESSAGE_CONFIG[type] || MESSAGE_CONFIG.info
    const emoji = EMOJI[type] || ''
    const text = i18next.t(messageCode)

    this.container.innerHTML = `<div class="${colorClass} mb-2">${emoji}${text}</div>`

    this.timeout = setTimeout(() => this.clear(), MESSAGE_DISPLAY_TIME)
  }

  clear() {
    this.container.innerHTML = ''
    if (this.timeout) {
      clearTimeout(this.timeout)
      this.timeout = null
    }
  }
}
