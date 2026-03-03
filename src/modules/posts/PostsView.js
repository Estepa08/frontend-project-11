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

    render(posts, feedTitle) {
        if (!posts || posts.length === 0) {
            this.hide();
            return;
        }

        // Проверяем, есть ли уже заголовок секции
        let sectionHeader = this.container.parentNode.querySelector('h2.section-header');
        if (!sectionHeader) {
            // Создаем заголовок секции "Посты"
            sectionHeader = document.createElement('h2');
            sectionHeader.className = 'section-header mb-3';
            sectionHeader.setAttribute('data-i18n', 'sections.posts');
            sectionHeader.textContent = i18next.t('sections.posts');
            this.container.parentNode.insertBefore(sectionHeader, this.container);
        }

        this.currentFeedTitle = feedTitle;
        this.show();
        this.clear();

        // this.renderHeader();
        this.renderPosts(posts);
    }

    renderHeader() {
        const clone = this.headerTemplate.content.cloneNode(true);
        const headerEl = clone.querySelector('h5');

        // Добавляем класс для отступа
        headerEl.classList.add('mt-2', 'mb-3');

        const titleText = i18next.t('posts.header', { feedTitle: this.currentFeedTitle });
        headerEl.innerHTML = `<i class="fas fa-newspaper me-2 text-primary"></i>${titleText}`;

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
        previewBtn.textContent = i18next.t('modal.readFull');
        previewBtn.dataset.postId = post.id;

        wrapper.appendChild(link);
        wrapper.appendChild(previewBtn);
        container.appendChild(wrapper);
    }

    showPreview(post) {
        if (!this.modal) {
            return;
        }

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
