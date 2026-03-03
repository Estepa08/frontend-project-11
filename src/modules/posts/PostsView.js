// modules/posts/PostsView.js
import i18next from 'i18next';
import View from '../../core/View.js';
import { MAX_POST_DESCRIPTION_LENGTH } from '../../utils/constants.js';

const truncate = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

const formatDate = (dateString) => {
    try {
        return new Date(dateString).toLocaleDateString();
    } catch {
        return '';
    }
};

export default class PostsView extends View {
    constructor(container, postTemplate) {
        super(container);
        this.postTemplate = postTemplate;

        const modalElement = document.getElementById('postModal');
        if (modalElement && window.bootstrap) {
            this.modal = new window.bootstrap.Modal(modalElement);
            this.modalTitle = modalElement.querySelector('.modal-title');
            this.modalDescription = modalElement.querySelector('.modal-body .post-description');
            this.modalLink = modalElement.querySelector('.btn-primary');
            this.modalCloseBtn = modalElement.querySelector('.btn-secondary');
        }
    }

    onPreviewClick(handler) {
        this.on('click', '.preview-btn', (e) => {
            const btn = e.target.closest('.preview-btn');
            const postId = btn?.dataset?.postId;
            if (postId && handler) {
                handler(postId);
            }
        });
    }

    render(posts) {
        this.clear();

        // Удаляем существующий заголовок в ЭТОЙ колонке
        const existingHeader = this.container.parentNode.querySelector('h2');
        if (existingHeader) {
            existingHeader.remove();
        }

        if (!posts || posts.length === 0) {
            this.hide();
            return;
        }

        // Создаем заголовок "Посты" прямо перед контейнером
        const header = document.createElement('h2');
        header.setAttribute('data-i18n', 'sections.posts');
        header.textContent = i18next.t('sections.posts');
        this.container.parentNode.insertBefore(header, this.container);

        this.show();
        this.renderPosts(posts);
    }

    renderPosts(posts) {
        // Сортируем посты по дате (новые сверху)
        const sortedPosts = [...posts].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        sortedPosts.forEach((post) => this.renderPost(post));
    }

    renderPost(post) {
        const clone = this.postTemplate.content.cloneNode(true);

        // Находим ссылку и заполняем
        const link = clone.querySelector('a');
        link.href = post.link;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add(post.isRead ? 'fw-normal' : 'fw-bold');

        // Заголовок поста
        const titleEl = link.querySelector('.post-title');
        if (titleEl) titleEl.textContent = post.title;

        // Дата поста
        const dateEl = link.querySelector('.post-date');
        if (dateEl) dateEl.textContent = formatDate(post.pubDate);

        // Описание поста (если есть)
        const descEl = link.querySelector('.post-description');
        if (descEl && post.description) {
            descEl.textContent = truncate(post.description, MAX_POST_DESCRIPTION_LENGTH);
        }

        // Создаем контейнер для поста с кнопкой
        const container = document.createElement('div');
        container.className = 'd-flex align-items-center mb-2';

        // Добавляем ссылку
        container.appendChild(link);

        // Добавляем кнопку предпросмотра
        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn btn-sm btn-outline-primary ms-2 preview-btn';
        previewBtn.textContent = i18next.t('modal.readFull');
        previewBtn.dataset.postId = post.id;
        container.appendChild(previewBtn);

        this.container.appendChild(container);
    }

    showPreview(post) {
        if (!this.modal) return;

        this.modalTitle.textContent = post.title;
        this.modalDescription.textContent = post.description || 'Нет описания';
        this.modalLink.href = post.link;

        this.modalLink.textContent = i18next.t('modal.readFull');
        if (this.modalCloseBtn) {
            this.modalCloseBtn.textContent = i18next.t('modal.close');
        }

        this.modal.show();
    }
}
