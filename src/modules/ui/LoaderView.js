// modules/ui/LoaderView.js
import View from '../../core/View.js';

export default class LoaderView extends View {
    constructor(container) {
        super(container);
        this.isLoading = false;
    }

    show() {
        this.isLoading = true;
        this.container.style.display = 'block';
        this.container.innerHTML = '<div class="spinner-border text-primary"></div>';
    }

    hide() {
        this.isLoading = false;
        this.container.style.display = 'none';
        this.container.innerHTML = '';
    }

    toggle(loading) {
        loading ? this.show() : this.hide();
    }
}
