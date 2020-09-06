import EventEmitter from './event-emitter';

export interface Listener<TEvent> {
  (event: TEvent): void;
}

export interface Unsubscribe {
  (): void;
}

export interface IObservable<TValue> {
  value: TValue;
  get(): TValue;
  set(value: TValue): this;
  subscribe(listener: Listener<TValue>): Unsubscribe;
  unsubscribe(listener: Listener<TValue>): this;
}

/**
 * Observale value container that emits an update event whenever the value is changed
 */
class Observable<TValue> extends EventEmitter<TValue> implements IObservable<TValue> {
  #value: TValue;

  /**
   * Construct Observable
   * @example
   * ```js
   * const observable = new Observable(42) // observable.value -> 42
   *
   * // Read observable´s value
   * observable.value // 42
   * observable.get() // 42
   *
   * // Change observable´s value
   * observable.value = 100 // observable.value -> 100
   * observable.set(150) // observable.value -> 150
   *
   * // Listen on changes
   * observable.subscribe((value) => ...)
   * observable.unsubscribe((value) => ...)
   * ```
   * @param {TValue} initialValue Initial value
   */
  constructor(initialValue: TValue) {
    super();
    // Observable value
    this.#value = initialValue;
    // Binds
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /**
   * Return observable´s value
   * @example
   * ```js
   * observable.value // 42
   * ```
   */
  get value(): TValue {
    return this.get();
  }

  /**
   * Set observable´s value
   * @example
   * ```js
   * observable.value = 42
   * ```
   * @param {TValue} value
   */
  set value(value: TValue) {
    this.set(value);
  }

  /**
   * Return observable´s value
   * @example
   * ```js
   * observable.get() // 42
   * ```
   */
  get(): TValue {
    return this.#value;
  }

  /**
   * Set observable´s value
   * Note: Will not be updated if the value is the same as current value
   * @example
   * ```js
   * observable.set(42)
   * ```
   * @param {TValue} value
   */
  set(value: TValue): this {
    const newValue = typeof value === 'function' ? value(this.#value) : value;
    if (newValue === this.#value) return this;
    this.#value = newValue;
    this.emit('update', newValue);
    return this;
  }

  /**
   * Subscribe to changes
   * @example
   * ```js
   * const listener = (value) => ...
   * observable.subscribe(listener)
   * ```
   * @param {Listener<TValue>} fn
   */
  subscribe(fn: Listener<TValue>): Unsubscribe {
    return this.on('update', fn);
  }

  /**
   * Unsubscribe from listening on changes
   * @example
   * ```js
   * const listener = (value) => ...
   * observable.unsubscribe(listener)
   * ```
   * @param {Listener<TValue>} fn
   */
  unsubscribe(fn: Listener<TValue>): this {
    return this.off('update', fn);
  }

  /**
   * Factory for creating an observable
   * @example
   * ```js
   * Observable.from(42)
   * ```
   * @param {TValue} value
   */
  static from<TValue>(value: TValue): Observable<TValue> {
    return new Observable(value);
  }
}

export default Observable;
