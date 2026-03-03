import { proxy, snapshot, subscribe } from 'valtio/vanilla';

export default class Model {
    constructor(initialState = {}) {
        this.state = proxy(initialState);
        this.subscribers = [];

        subscribe(this.state, () => {
            const snap = snapshot(this.state);
            this.notify(snap);
        });
    }

    subscribe(callback) {
        this.subscribers.push(callback);

        callback(snapshot(this.state));
        return () => this.unsubscribe(callback);
    }

    unsubscribe(callback) {
        this.subscribers = this.subscribers.filter((cb) => cb !== callback);
    }

    setState(newState) {
        Object.assign(this.state, newState);
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
