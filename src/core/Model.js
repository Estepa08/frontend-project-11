// core/Model.js
import { proxy, subscribe, snapshot } from 'valtio/vanilla';

export default class Model {
    constructor(initialState = {}) {
        // Создаем реактивное состояние через proxy
        this.state = proxy(initialState);
        this.subscribers = [];

        // Подписываемся на изменения состояния
        subscribe(this.state, () => {
            const snap = snapshot(this.state);
            this.notify(snap);
        });
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        // Сразу вызываем с текущим состоянием
        callback(snapshot(this.state));
        return () => this.unsubscribe(callback);
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    }

    setState(newState) {
        // В Valtio мы мутируем состояние напрямую
        Object.assign(this.state, newState);
        // notify вызывается автоматически через subscribe
    }

    notify(state) {
        this.subscribers.forEach((callback) => {
            try {
                callback(state);
            } catch (error) {
                console.error('Error in subscriber:', error);
            }
        });
    }

    getState() {
        return snapshot(this.state);
    }
}
