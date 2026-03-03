// modules/ui/FormView.js
import i18next from 'i18next';
import View from '../../core/View.js';

export default class FormView extends View {
    constructor(container) {
        super(container);
        this.input = container.querySelector('#rss-input');
        this.submitButton = container.querySelector('button[type="submit"]');
        this.label = document.querySelector('label[for="rss-input"]');
        this.exampleEl = document.querySelector('.text-muted.small');
        this.handlers = { submit: null };
    }

    init() {
        this.initEventListeners();
        this.setLanguageTexts();
    }

    onSubmit(handler) {
        this.handlers.submit = handler;
    }

    initEventListeners() {
        this.submitButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (this.handlers.submit) {
                this.handlers.submit(this.getValue());
            }
        });

        this.container.addEventListener('submit', (e) => e.preventDefault());

        this.input.addEventListener('input', () => {
            if (this.hasError()) {
                this.clearError();
            }
        });
    }

    setLanguageTexts() {
        // Текст кнопки и placeholder
        this.input.placeholder = i18next.t('form.placeholder');
        this.submitButton.textContent = i18next.t('form.addButton');

        // 👇 ДОБАВЛЯЕМ ТЕКСТ ЛЕЙБЛА
        if (this.label) {
            this.label.textContent = i18next.t('form.label');
        }

        // 👇 ДОБАВЛЯЕМ ТЕКСТ ПРИМЕРА
        if (this.exampleEl) {
            this.exampleEl.textContent = i18next.t('form.example');
        }
    }

    getValue() {
        return this.input.value.trim();
    }

    clear() {
        this.input.value = '';
    }

    focus() {
        this.input.focus();
    }

    showError() {
        this.input.classList.add('is-invalid');
    }

    clearError() {
        this.input.classList.remove('is-invalid');
    }

    hasError() {
        return this.input.classList.contains('is-invalid');
    }

    setLoading(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.innerHTML = isLoading
            ? '<span class="spinner-border spinner-border-sm me-2"></span>' + i18next.t('loading')
            : i18next.t('form.addButton');
    }
}
