// app/init.js
import i18next from 'i18next';
import * as yup from 'yup';
import Controller from '../core/Controller.js';
import resources from '../locales/index.js';
import FeedsManager from '../modules/feeds/FeedsManager.js';
import FeedsView from '../modules/feeds/FeedsView.js';
import PostsManager from '../modules/posts/PostsManager.js';
import PostsView from '../modules/posts/PostsView.js';
import FormView from '../modules/ui/FormView.js';
import MessageView from '../modules/ui/MessageView.js';
import { fetchRss } from '../services/api.js';
import parseRss from '../services/rssParser.js';
import { validateUrl } from '../services/validator.js';
import config from './config.js';

const UPDATE_INTERVAL = 5000;

class AppController extends Controller {
    constructor() {
        super(null, null);

        this.feedsManager = new FeedsManager();
        this.postsManager = new PostsManager();
        this.updateTimer = null;
        this.isUpdating = false;

        this.formView = new FormView(document.getElementById('rss-form'));
        this.feedsView = new FeedsView(
            document.getElementById('feeds'),
            document.getElementById('feed-template')
        );
        this.postsView = new PostsView(
            document.getElementById('posts-container'),
            document.getElementById('post-template'),
            document.getElementById('posts-header-template')
        );
        this.messageView = new MessageView(document.getElementById('messages-container'));

        this.init();
        this.lastProxyError = null;
    }

    async init() {
        await i18next.init({
            resources,
            lng: config.i18n.lng,
            interpolation: { escapeValue: false },
        });

        yup.setLocale({
            mixed: { required: () => i18next.t('errors.urlRequired') },
            string: { url: () => i18next.t('errors.urlInvalid') },
        });

        this.formView.init();
        this.formView.onSubmit(this.handleSubmit.bind(this));
        this.feedsView.onFeedClick(this.handleFeedClick.bind(this));

        // ✅ Правильно: вызываем метод postsView.onPreviewClick
        if (this.postsView && typeof this.postsView.onPreviewClick === 'function') {
            this.postsView.onPreviewClick(this.handlePreview.bind(this));
            console.log('✅ Подписка на preview добавлена');
        } else {
            console.warn('⚠️ postsView.onPreviewClick не доступен', this.postsView);
        }

        this.feedsManager.subscribe((state) => {
            console.log('🔄 Фиды обновлены:', state.feeds);
            this.feedsView.render(state.feeds);
        });

        this.updateView();
        this.startAutoUpdate();
    }

    startAutoUpdate() {
        const update = async () => {
            if (this.isUpdating) return;

            this.isUpdating = true;
            const feeds = this.feedsManager.getState().feeds;

            for (const feed of feeds) {
                try {
                    await this.checkFeedUpdates(feed);
                } catch (error) {
                    console.error(`Ошибка обновления ${feed.url}:`, error);
                }
            }

            this.isUpdating = false;
            this.updateTimer = setTimeout(update, UPDATE_INTERVAL);
        };

        this.updateTimer = setTimeout(update, UPDATE_INTERVAL);
    }

    async checkFeedUpdates(feed) {
        try {
            const xmlText = await fetchRss(feed.url);
            const data = parseRss(xmlText, feed.url);

            const existingPosts = this.postsManager.getPostsByFeedUrl(feed.url);

            const newPosts = data.posts.filter(
                (newPost) => !existingPosts.some((existing) => existing.title === newPost.title)
            );

            if (newPosts.length > 0) {
                this.postsManager.addPosts(
                    newPosts.map((post) => ({
                        ...post,
                        feedUrl: feed.url,
                    }))
                );

                this.feedsManager.updateFeed(feed.id, {
                    postCount: (feed.postCount || 0) + newPosts.length,
                });

                this.messageView.show(
                    `📢 ${newPosts.length} новых постов в "${feed.title}"`,
                    'info'
                );
                this.updateView();
            }
        } catch (error) {
            console.error(`Ошибка обновления ${feed.url}:`, error);

            if (!this.lastProxyError || Date.now() - this.lastProxyError > 60000) {
                if (error.message === 'errors.proxyUnavailable') {
                    this.messageView.show('errors.proxyUnavailable', 'warning');
                } else if (error.message === 'errors.tooManyRequests') {
                    this.messageView.show('errors.tooManyRequests', 'warning');
                } else {
                    this.messageView.show(error.message || 'errors.network', 'danger');
                }
                this.lastProxyError = Date.now();
            }
        }
    }

    async handleSubmit(url) {
        this.formView.clearError();
        this.formView.setLoading(true);

        if (!url || url.trim() === '') {
            this.formView.setLoading(false);
            this.messageView.show('errors.urlRequired', 'danger');
            this.formView.showError();
            return;
        }

        try {
            await validateUrl(url, this.feedsManager.getState().feeds);
            const xmlText = await fetchRss(url);
            const { feed, posts } = parseRss(xmlText, url);

            this.feedsManager.addFeed(feed);
            this.postsManager.addPosts(posts);

            this.messageView.show('messages.feedAdded', 'success');
            this.formView.clear();
            this.formView.focus();
        } catch (error) {
            console.error('Ошибка:', error);

            if (error.message?.startsWith('errors.')) {
                if (
                    error.message === 'errors.urlRequired' ||
                    error.message === 'errors.urlInvalid' ||
                    error.message === 'errors.duplicate'
                ) {
                    this.formView.showError();
                }
                this.messageView.show(error.message, 'danger');
            } else {
                this.messageView.show('errors.unknown', 'danger');
            }
        } finally {
            this.formView.setLoading(false);
        }
    }

    handleFeedClick(id) {
        const feed = this.feedsManager.getFeedById(id);
        if (!feed) return;

        const posts = this.postsManager.getPostsByFeedUrl(feed.url);
        this.postsView.render(posts, feed.title);
    }

    handlePreview(postId) {
        console.log('handlePreview получил postId:', postId, 'тип:', typeof postId);

        const post = this.postsManager.getPostById(postId);

        if (!post) {
            console.error('Пост не найден:', postId);
            return;
        }

        this.postsManager.markAsRead(postId);
        this.postsView.showPreview(post);

        const feed = this.feedsManager.getFeedByUrl(post.feedUrl);
        if (feed) {
            const posts = this.postsManager.getPostsByFeedUrl(post.feedUrl);
            this.postsView.render(posts, feed.title);
        }
    }

    updateView() {
        const feeds = this.feedsManager.getState().feeds;
        this.feedsView.render(feeds);
    }
}

export const initApp = () => {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new AppController();
        console.log('✅ RSS Aggregator запущен!');
    });
};
