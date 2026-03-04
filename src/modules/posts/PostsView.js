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

        // Убираем удаление и создание заголовка - он уже есть в HTML

        if (!posts || posts.length === 0) {
            this.hide();
            return;
        }

        this.show();
        this.renderPosts(posts);
    }

    renderPosts(posts) {
        const sortedPosts = [...posts].sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

        sortedPosts.forEach((post) => this.renderPost(post));
    }

    renderPost(post) {
        console.log('📝 Рендерим пост с заголовком:', post.title);
        console.log('📝 Класс:', post.isRead ? 'fw-normal' : 'fw-bold');

        const clone = this.postTemplate.content.cloneNode(true);
        const li = clone.querySelector('li'); // берём li из шаблона

        const link = li.querySelector('a');
        link.href = post.link;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add(post.isRead ? 'fw-normal' : 'fw-bold');

        const titleEl = link.querySelector('.post-title');
        if (titleEl) titleEl.textContent = post.title;

        const dateEl = link.querySelector('.post-date');
        if (dateEl) dateEl.textContent = formatDate(post.pubDate);

        const descEl = link.querySelector('.post-description');
        if (descEl && post.description) {
            descEl.textContent = truncate(post.description, MAX_POST_DESCRIPTION_LENGTH);
        }

        const previewBtn = li.querySelector('.preview-btn');
        previewBtn.dataset.postId = post.id;

        this.container.appendChild(li);
    }

    showPreview(post) {
        if (!this.modal) return;

        this.modalTitle.textContent = post.title;
        this.modalDescription.textContent = post.description || i18next.t('posts.noDescription');
        this.modalLink.href = post.link;

        this.modalLink.textContent = i18next.t('modal.readFull');
        if (this.modalCloseBtn) {
            this.modalCloseBtn.textContent = i18next.t('modal.close');
        }

        this.modal.show();
    }
}
