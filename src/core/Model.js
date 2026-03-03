// core/Model.js
export default class Model {
  constructor(initialState = {}) {
    this.state = { ...initialState };
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    callback(this.state);
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(cb => cb !== callback);
  }

  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notify(prevState);
  }

  notify(prevState) {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state, prevState);
      } catch (error) {
        console.error('Error in subscriber:', error);
      }
    });
  }

  getState() {
    return { ...this.state };
  }
}