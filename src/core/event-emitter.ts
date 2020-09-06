export interface Listener<TEvent> {
  (event: TEvent): void;
}

export interface Unsubscribe<TReturn> {
  (): TReturn;
}

export type Listeners<TEvent> = { [key: string]: Listener<TEvent>[] };

/**
 * Simple implementation of event emitter compatible for browser
 */
class EventEmitter<TEvent> {
  #listeners: Listeners<TEvent>;

  /**
   * Construct EventEmitter
   * @example
   * ```js
   * const emitter = new EventEmitter()
   * const listener = () => ...
   * emitter.on('update', listener)
   * emitter.off('update', listener)
   * emitter.emit('update', { payload: 'data' })
   * ```
   */
  constructor() {
    this.#listeners = {};
  }

  /**
   * Register a listener
   * @example
   * ```js
   * const listener = () => ...
   * emitter.off('update', listener)
   * ```
   * @param {string} type
   * @param {Listener<TEvent>} listener
   */
  on(type: string, listener: Listener<TEvent>): Unsubscribe<this> {
    if (!type) throw new Error('Cannot call <EventEmitter>.on without a type');
    if (!listener) throw new Error('Cannot call <EventEmitter>.on without a listener');
    this.#listeners[type] = this.#listeners[type] || [];
    this.#listeners[type].push(listener);
    return () => this.off(type, listener);
  }

  /**
   * Unregister listener
   * @example
   * ```js
   * const listener = () => ...
   * emitter.off('update', listener)
   * ```
   * @param {string} type
   * @param {Listener<TEvent>} listener
   */
  off(type: string, listener: Listener<TEvent>): this {
    if (!type) throw new Error('Cannot call <EventEmitter>.off without a type');
    if (!listener) throw new Error('Cannot call <EventEmitter>.off without a listener');
    if (!this.#listeners[type]) return this;
    const listeners = this.#listeners[type].filter((fn) => fn !== listener);
    if (listeners.length > 0) {
      this.#listeners[type] = listeners;
    } else {
      delete this.#listeners[type];
    }
    return this;
  }

  /**
   * Emit event
   * @example
   * ```js
   * emitter.emit('update', { payload: 'data' })
   * ```
   * @param {string} type
   * @param {TEvent} event
   */
  emit(type: string, event: TEvent): this {
    if (!type) throw new Error('Cannot call <EventEmitter>.emit without a type');
    if (!this.#listeners[type]) return this;
    this.#listeners[type].forEach((listener) => listener(event));
    return this;
  }
}

export default EventEmitter;
