// modules/posts/PostsView.js
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
        clone.querySelector('.feed-title').textContent = this.currentFeedTitle;
        this.container.appendChild(clone);
    }

    renderPosts(posts) {
        const postsList = this.container.querySelector('.posts-list');
        posts.forEach((post) => this.renderPost(post, postsList));
    }

    renderPost(post, container) {
        const clone = this.postTemplate.content.cloneNode(true);
        const link = clone.querySelector('a');

        link.href = post.link;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        link.classList.add(post.isRead ? 'fw-normal' : 'fw-bold');

        link.querySelector('.post-title').textContent = post.title;
        link.querySelector('.post-date').textContent = formatDate(post.pubDate);

        if (post.description) {
            link.querySelector('.post-description').textContent = truncate(
                post.description,
                MAX_POST_DESCRIPTION_LENGTH
            );
        }

        container.appendChild(link);
    }
}
