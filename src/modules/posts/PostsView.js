import 'bootstrap';
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

        // Инициализируем модальное окно (оно уже есть в HTML)
        const modalElement = document.getElementById('postModal');
        if (modalElement) {
            this.modal = new window.bootstrap.Modal(modalElement);
            this.modalTitle = modalElement.querySelector('.modal-title');
            this.modalDescription = modalElement.querySelector('.modal-body .post-description');
            this.modalLink = modalElement.querySelector('.btn-primary');
        } else {
            console.error('Модальное окно с id="postModal" не найдено в HTML');
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
        const titleEl = clone.querySelector('.feed-title');
        if (titleEl) {
            titleEl.textContent = this.currentFeedTitle;
        }
        this.container.appendChild(clone);
    }

    renderPosts(posts) {
        // Создаем контейнер для списка постов
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
        console.log('🎨 Рендерим пост:', post); // 👈 ПОСМОТРИМ ВЕСЬ ОБЪЕКТ

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

        // Добавляем кнопку просмотра
        const previewBtn = document.createElement('button');
        previewBtn.className = 'btn btn-sm btn-outline-primary ms-2 preview-btn';
        previewBtn.textContent = 'Просмотр';
        previewBtn.dataset.postId = post.id;
        console.log('🔘 Устанавливаем data-postId =', post.id, 'тип:', typeof post.id); // 👈 ПРОВЕРЯЕМ

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
        this.modal.show();
    }
}
