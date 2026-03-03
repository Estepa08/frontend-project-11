// modules/feeds/FeedsView.js
import i18next from 'i18next';
import View from '../../core/View.js';
import { MAX_DESCRIPTION_LENGTH } from '../../utils/constants.js';

const truncate = (text, maxLength) => {
    if (!text) return 'Нет описания';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

export default class FeedsView extends View {
    constructor(container, template) {
        super(container, { template });
    }

    onFeedClick(handler) {
        this.on('click', '.feed-item', (e) => {
            const item = e.target.closest('.feed-item');
            const id = item?.dataset?.id;
            if (id && handler) {
                handler(parseInt(id));
            }
        });
    }

    render(feeds) {
        console.log('🎨 FeedsView.render вызван, feeds:', feeds);
        console.log('📦 this.container:', this.container);
        console.log('📋 this.template:', this.template);

        this.clear();
        console.log('🧹 После clear, container.innerHTML:', this.container.innerHTML);

        if (!feeds || feeds.length === 0) {
            console.log('⚠️ Нет фидов для отображения');
            return;
        }

        console.log(`🔄 Рендерим ${feeds.length} фидов`);

        feeds.forEach((feed, index) => {
            console.log(`📌 Фид ${index}:`, feed);

            const clone = this.template.content.cloneNode(true);
            console.log('📋 Клон создан');

            const item = clone.querySelector('a');
            console.log('🔗 Элемент a найден:', item);

            item.dataset.id = feed.id;
            item.querySelector('.feed-title').textContent = feed.title || feed.url;
            item.querySelector('.feed-description').textContent = truncate(
                feed.description,
                MAX_DESCRIPTION_LENGTH
            );
            item.querySelector('.feed-date').textContent = feed.addedAt;
            item.querySelector('.feed-posts-count').textContent = feed.postCount || 0;

            this.container.appendChild(clone);
            console.log(`✅ Фид ${index} добавлен в DOM`);
        });

        console.log('🏁 После рендера, container.innerHTML:', this.container.innerHTML);
    }

    showEmpty() {
        this.container.innerHTML = `
      <div class="alert alert-info">
        ${i18next.t('messages.noFeeds')}
      </div>
    `;
    }
}
