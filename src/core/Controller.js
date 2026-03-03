export default class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.unsubscribe = null;

        if (this.model && typeof this.model.subscribe === 'function') {
            this.unsubscribe = this.model.subscribe((state, _prevState) => {
                this.handleModelChange(state, _prevState);
            });
        }
    }

    handleModelChange(state, _prevState) {
        if (this.view && typeof this.view.render === 'function') {
            this.view.render(state);
        }
    }

    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }
}
