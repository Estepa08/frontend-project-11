export default function parseRss(xmlText, sourceUrl) {
  console.log('📥 ===== НАЧАЛО ПАРСИНГА =====')
  console.log('📥 URL:', sourceUrl)
  console.log('📥 XML длина:', xmlText.length)
  console.log('📥 Первые 200 символов XML:', xmlText.substring(0, 200))
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlText, 'application/xml')

  const errorNode = doc.querySelector('parsererror')
  if (errorNode) throw new Error('errors.invalidRss')

  const channel = doc.querySelector('channel')
  if (!channel) throw new Error('errors.invalidRss')

  const feedTitle = channel.querySelector('title')?.textContent || 'Без названия'
  const feedDescription = channel.querySelector('description')?.textContent || ''

  const items = channel.querySelectorAll('item')
  const posts = Array.from(items).map((item, index) => {
    const descriptionEl = item.querySelector('description')
    let description = ''

    if (descriptionEl) {
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = descriptionEl.textContent || ''
      description = tempDiv.textContent || tempDiv.innerText || ''
      description = description.trim()
    }

    return {
      id: `${sourceUrl}-${index}-${Date.now()}`,
      feedUrl: sourceUrl,
      title: item.querySelector('title')?.textContent || 'Без заголовка',
      description: description,
      link: item.querySelector('link')?.textContent || '#',
      pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
      isRead: false,
    }
  })

  return {
    feed: {
      id: Date.now(),
      url: sourceUrl,
      title: feedTitle,
      description: feedDescription,
      postCount: posts.length,
    },
    posts,
  }
}
