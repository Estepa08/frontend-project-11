// Парсинг RSS (чистая функция)
export default function parseRss(xmlText, sourceUrl) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    throw new Error('errors.invalidRss');
  }
  
  const channel = doc.querySelector('channel');
  if (!channel) {
    throw new Error('errors.invalidRss');
  }
  
  const feedTitle = channel.querySelector('title')?.textContent || 'Без названия';
  const feedDescription = channel.querySelector('description')?.textContent || 'Нет описания';
  
  const items = channel.querySelectorAll('item');
  const posts = Array.from(items).map((item, index) => ({
    id: `${sourceUrl}-${index}-${Date.now()}`,
    feedUrl: sourceUrl,
    title: item.querySelector('title')?.textContent || 'Без заголовка',
    description: item.querySelector('description')?.textContent || '',
    link: item.querySelector('link')?.textContent || '#',
    pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
  }));
  
  return {
    feed: {
      id: Date.now(),
      url: sourceUrl,
      title: feedTitle,
      description: feedDescription,
      addedAt: new Date().toLocaleString(),
      postCount: posts.length,
    },
    posts
  };
}