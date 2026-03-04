export default class View {
  constructor(container, options = {}) {
    if (!container) throw new Error('Container is required')

    this.container = container
    this.template = options.template
    this.handlers = {}
  }

  on(event, selector, handler) {
    if (!this.handlers[event]) {
      this.handlers[event] = []

      this.container.addEventListener(event, (e) => {
        this.handlers[event].forEach(({ selector, handler }) => {
          if (!selector || e.target.closest(selector)) {
            handler(e)
          }
        })
      })
    }

    this.handlers[event].push({ selector, handler })
    return this
  }

  clear() {
    this.container.innerHTML = ''
  }

  render(data) {
    if (this.template) {
      if (this.template instanceof HTMLTemplateElement) {
        this.container.innerHTML = ''
        const clone = this.template.content.cloneNode(true)
        this.container.appendChild(clone)
      }
      else if (typeof this.template === 'function') {
        this.container.innerHTML = this.template(data)
      }
    }
  }

  show() {
    this.container.style.display = ''
  }

  hide() {
    this.container.style.display = 'none'
  }

  addClass(className) {
    this.container.classList.add(className)
  }

  removeClass(className) {
    this.container.classList.remove(className)
  }
}
