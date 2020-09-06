import Observable, { IObservable, Listener, Unsubscribe } from './observable';
import EventEmitter from './event-emitter';

type ObservableByKey<TValue> = { [key: string]: IObservable<TValue> };
type ObservableValues<TValue> = { [key: string]: TValue };

/**
 * Collection is an observable container of multiple observable values.
 * Whenever one of the values changes the collection is chnaged as well.
 */
class Collection<TValue> extends EventEmitter<ObservableValues<TValue>>
  implements IObservable<ObservableValues<TValue>> {
  #value: ObservableValues<TValue>;

  #observables: ObservableByKey<TValue>;

  #meta: { [key: string]: { unsubscribe: () => void } };

  /**
   * Constructs a Collection
   * @example
   * ```
   * // Create a collection
   * const collection = new ObservableCollection({ x: Observable<5>, y: Observable<12> })
   *
   * // Read from collection
   * collection.value // { x: 5, y: 12 }
   * collection.get() // { x: 5, y: 12 }
   *
   * // Update collection´s values
   * collection.set({ x: 42 }) // collection.value -> { x: 42, y: 12 }
   * collection.value = { x: 42 } // collection.value -> { x: 42, y: 12 }
   *
   * // Add to collection
   * collection.add({ z: Observable<100>, ... }) // collection.value -> { x: 42, y: 12, z: 100 }
   *
   * // Remove from collection
   * collection.remove("x")
   * collection.remove(["x", "y"])
   *
   * // Listen on changes
   * collection.subscribe(({ key, observable }) => ...)
   * collection.unsubscribe(({ key, observable }) => ...)
   * ```
   * @param {ObservableByKey<TValue>} [observables={}]
   */
  constructor(observables: ObservableByKey<TValue> = {}) {
    super();
    // Observable value
    this.#value = {};
    this.#observables = {};
    this.#meta = {};
    // Binds
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);

    this.add(observables);
  }

  /**
   * Return observable´s value
   * @example
   * ```js
   * observable.value // { x: 42, y: 23 }
   * ```
   */
  get value(): ObservableValues<TValue> {
    return this.#value;
  }

  /**
   * Partially update existing values
   * @example
   * ```js
   * collection.value = { x: 5, y: (y) => y + 15 }
   * ```
   * @param {ObservableValues<TValue>} collection
   */
  set value(collection: ObservableValues<TValue>) {
    this.set(collection);
  }

  /**
   * Return observable´s value
   * @example
   * ```js
   * observable.get() // { x: 42, y: 23 }
   * ```
   */
  get(): ObservableValues<TValue> {
    return this.#value;
  }

  /**
   * Partially update existing values
   * @example
   * ```js
   * collection.set({ x: 5, y: (y) => y + 15 })
   * ```
   * @param {ObservableValues<TValue>} collection
   */
  set(collection: ObservableValues<TValue>): this {
    Object.keys(collection)
      .filter((key) => this.#value[key])
      .forEach((key) => {
        this.#observables[key].set(collection[key]);
      });
    return this;
  }

  /**
   * Return collection keys
   * @example
   * ```js
   * collection.keys() // ['x', 'y']
   * ```
   */
  get keys(): string[] {
    return Object.keys(this.#observables);
  }

  /**
   * Return single observable by key path or null
   * @example
   * ```js
   * collection.one('users')
   * collection.one(['users', '10f2d975'])
   * collection.one('users.10f2d975')
   * ```
   * @param {string|string[]} key
   */
  one(key: string | string[]): null | IObservable<TValue> {
    const [path, ...paths] = Array.isArray(key) ? key : key.split('.');
    const observable = this.#observables[path];
    if (!observable) return null;
    if (!paths.length) return observable;
    if (!(observable instanceof Collection)) return null;
    return observable.one(paths);
  }

  /**
   * Add observable(s)
   * @example
   * ```js
   * add({ x: Observable<42>, ... })
   * ```
   * @param {ObservableByKey<TValue>} observables
   */
  add(observables: ObservableByKey<TValue>): this {
    Object.keys(observables).forEach((key) => {
      // Check if the key already exists and if does then ubsubscribe from it
      if (this.#observables[key]) this.#meta[key].unsubscribe();
      // Add new observable
      const observable = observables[key];
      this.#observables[key] = observable;
      this.#value[key] = observable.value;
      const unsubscribe = observable.subscribe((value) => {
        this.#value[key] = value;
        this.emit('update', this.#value);
      });
      this.#meta[key] = this.#meta[key] || {};
      this.#meta[key].unsubscribe = unsubscribe;
      this.emit('update', this.#value);
    });
    return this;
  }

  /**
   * Remove observable(s) from collection
   * @example
   * ```js
   * collection.remove("x")
   * collection.remove(["x", "y", ...])
   * ```
   * @param {string | string[]} key
   */
  remove(key: string | string[]): this {
    // Array of keys
    if (Array.isArray(key)) {
      const keys = key;
      // eslint-disable-next-line no-shadow
      keys.forEach((key) => {
        const observable = this.#observables[key];
        if (!observable) return;
        this.#meta[key].unsubscribe();
        delete this.#meta[key];
        delete this.#observables[key];
        this.emit('update', this.#value);
      });
      return this;
    }

    // Single key
    if (!this.#observables[key]) return this;
    const observable = this.#observables[key];
    if (!observable) return this;
    this.#meta[key].unsubscribe();
    delete this.#meta[key];
    delete this.#observables[key];
    this.emit('update', this.#value);
    return this;
  }

  /**
   * Upsert observable(s)
   * @example
   * ```js
   * upsert({ x: Observable<42>, y: 30, ... })
   * ```
   * @param {ObservableByKey<TValue>} key
   */
  upsert(observables: ObservableByKey<TValue>): this {
    Object.keys(observables).forEach((key) => {
      const observable = this.#observables[key];
      // Add
      if (!observable) {
        this.add({ [key]: observables[key] });
        return;
      }
      // Update
      observable.set(observables[key].value);
    });
    return this;
  }

  /**
   * Return whether a key exists
   * @example
   * ```js
   * has('users')
   * has(['users', '10f2d975'])
   * has('users.10f2d975')
   * ```
   * @param {string|string[]} key
   */
  has(key: string | string[]): boolean {
    return Boolean(this.one(key));
  }

  /**
   * Sync collection
   * @example
   * ```js
   * sync({ x: Observable<42>, ... })
   * ```
   * @param observables
   */
  sync(observables: ObservableByKey<TValue>): this {
    [...this.keys, ...Object.keys(observables)].forEach((key) => {
      const observable = observables[key];
      // Obsevable does not exit anymore
      if (!observable) {
        this.remove(key);
        return;
      }
      // New observable
      if (!this.#value[key]) {
        this.add({ [key]: observable });
        return;
      }
      // Update existing one
      this.set({ [key]: observable.value });
    });
    return this;
  }

  /**
   * Remove all observables but keep your subscriptions
   */
  reset(): this {
    Object.keys(this.#meta).forEach((key) => {
      const { unsubscribe } = this.#meta[key];
      unsubscribe();
    });
    this.#value = {};
    this.#observables = {};
    this.#meta = {};
    return this;
  }

  /**
   * Subscribe to updates on any of the observables
   * @param {Listener<ObservableValues<TValue>>} fn
   */
  subscribe(fn: Listener<ObservableValues<TValue>>): Unsubscribe {
    return this.on('update', fn);
  }

  /**
   * Unsubscribe
   * @param {Listener<ObservableValues<TValue>>} fn
   */
  unsubscribe(fn: Listener<ObservableValues<TValue>>): this {
    return this.off('update', fn);
  }

  /**
   * Create static observable collection
   * @example
   * ```js
   * Collection.from({ x: 5, y: 27, z: 42 })
   * ```
   * @param {ObservableValues<TValue>} values
   */
  static from<TValue>(values: ObservableValues<TValue>): Collection<TValue> {
    return new Collection(
      Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: Observable.from(values[key]) }),
        {}
      )
    );
  }
}

export default Collection;
