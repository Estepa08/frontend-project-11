// modules/posts/PostsView.js
import View from '../../core/View.js';
import i18next from 'i18next';
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
    constructor(container, postTemplate, headerTemplate) {
        super(container);
        this.postTemplate = postTemplate;
        this.headerTemplate = headerTemplate;
        this.currentFeedTitle = '';

        const modalElement = document.getElementById('postModal');
        if (modalElement && window.bootstrap) {
            this.modal = new window.bootstrap.Modal(modalElement);
            this.modalTitle = modalElement.querySelector('.modal-title');
            this.modalDescription = modalElement.querySelector('.modal-body .post-description');
            this.modalLink = modalElement.querySelector('.btn-primary');
            this.modalCloseBtn = modalElement.querySelector('.btn-secondary'); // 👈 ДЛЯ КНОПКИ ЗАКРЫТЬ
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

    render(posts, feedTitle) {
        if (!posts || posts.length === 0) {
            this.hide();
            return;
        }

        this.currentFeedTitle = feedTitle;
        this.show();
        this.clear();

        this.renderHeader();
        this.renderPosts(posts);
    }

    renderHeader() {
        const clone = this.headerTemplate.content.cloneNode(true);
        const headerEl = clone.querySelector('h5');
        const feedTitleSpan = clone.querySelector('.feed-title');

        // 👇 ЗАМЕНЯЕМ ТЕКСТ ЗАГОЛОВКА ЧЕРЕЗ i18next
        const titleText = i18next.t('posts.header', { feedTitle: this.currentFeedTitle });

        // Вариант 1: если хотим сохранить структуру с иконкой
        headerEl.innerHTML = `<i class="fas fa-newspaper me-2 text-primary"></i>${titleText}`;

        // feedTitleSpan больше не нужен, так как titleText уже содержит название фида
        if (feedTitleSpan) {
            feedTitleSpan.remove();
        }

        this.container.appendChild(clone);
    }

    renderPosts(posts) {
        let postsList = this.container.querySelector('.posts-list');
        if (!postsList) {
            postsList = document.createElement('div');
            postsList.className = 'posts-list';
            this.container.appendChild(postsList);
        } else {
            postsList.innerHTML = '';
        }

        posts.forEach((post) => this.renderPost(post, postsList));
    }

    renderPost(post, container) {
        const clone = this.postTemplate.content.cloneNode(true);
        const wrapper = document.createElement('div');
        wrapper.className = 'd-flex align-items-center mb-2';

        const link = clone.querySelector('a');
        link.href = post.link;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add(post.isRead ? 'fw-normal' : 'fw-bold', 'flex-grow-1');

        const titleEl = link.querySelector('.post-title');
        if (titleEl) titleEl.textContent = post.title;

        const dateEl = link.querySelector('.post-date');
        if (dateEl) dateEl.textContent = formatDate(post.pubDate);

        const descEl = link.querySelector('.post-description');
        if (descEl && post.description) {
            descEl.textContent = truncate(post.description, MAX_POST_DESCRIPTION_LENGTH);
        }

        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn btn-sm btn-outline-primary ms-2 preview-btn';
        previewBtn.textContent = i18next.t('modal.readFull'); // 👈 ИСПОЛЬЗУЕМ i18next
        previewBtn.dataset.postId = post.id;

        wrapper.appendChild(link);
        wrapper.appendChild(previewBtn);
        container.appendChild(wrapper);
    }

    showPreview(post) {
        if (!this.modal) {
            console.error('Модальное окно не инициализировано');
            return;
        }

        this.modalTitle.textContent = post.title;
        this.modalDescription.textContent = post.description || 'Нет описания';
        this.modalLink.href = post.link;

        // 👇 ДОБАВЛЯЕМ ТЕКСТЫ ДЛЯ КНОПОК МОДАЛКИ
        this.modalLink.textContent = i18next.t('modal.readFull');
        if (this.modalCloseBtn) {
            this.modalCloseBtn.textContent = i18next.t('modal.close');
        }

        this.modal.show();
    }
}
