// model/rssParser.js
export default function parseRss(xmlText, sourceUrl) {
  console.log('🔍 Парсим RSS для URL:', sourceUrl);
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    console.error('❌ Ошибка парсинга XML');
    throw new Error('errors.invalidRss');
  }
  
  const channel = doc.querySelector('channel');
  if (!channel) {
    console.error('❌ Не найден channel в RSS');
    throw new Error('errors.invalidRss');
  }
  
  // Извлекаем данные фида
  const feedTitle = channel.querySelector('title')?.textContent || 'Без названия';
  const feedDescription = channel.querySelector('description')?.textContent || '';
  console.log('📌 Название фида:', feedTitle);
  console.log('📝 Описание фида:', feedDescription || 'пусто');
  
  // Извлекаем посты
  const items = channel.querySelectorAll('item');
  console.log('📦 Найдено постов в RSS:', items.length);
  
  const posts = Array.from(items).map((item, index) => {
    const post = {
      id: `${sourceUrl}-${index}-${Date.now()}`,
      feedUrl: sourceUrl,
      title: item.querySelector('title')?.textContent || 'Без заголовка',
      description: item.querySelector('description')?.textContent || '',
      link: item.querySelector('link')?.textContent || '#',
      pubDate: item.querySelector('pubDate')?.textContent || new Date().toISOString(),
    };
    console.log(`  Пост ${index + 1}:`, post.title);
    return post;
  });
  
  const result = {
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
  
  console.log('✅ Результат парсинга:', result);
  return result;
}