import Atom, { IAtom } from './atom';
import EventEmitter, { Listener, Unsubscribe } from './event-emitter';

export type AtomsByKey<Value> = { [key: string]: IAtom<Value> };
export type AtomValuesByKey<Value> = { [key: string]: Value };
export type CollectionEvents<Value> = {
  update: AtomValuesByKey<Value>
}

/**
 * Collection is an observable container of multiple observable values.
 * Whenever one of the values changes the collection is changed as well.
 */
class Collection<Value>
  extends EventEmitter<CollectionEvents<Value>>
  implements IAtom<AtomValuesByKey<Value>> {
  #value: AtomValuesByKey<Value> = {};

  #atoms: AtomsByKey<Value> = {};

  #meta: { [key: string]: { unsubscribe: () => void } } = {};

  /**
   * Constructs a Collection
   * @example
   * ```
   * // Create a collection
   * const people = new Collection({
   *   // <id>: Atom<Value>
   *   1: atom({name: 'John'}),
   *   2: atom({name: 'Martha'}),
   *   ...
   * })
   *
   * // Read from collection
   * people.value // { 1: {name: 'John'}, 2: {name: 'Martha'} }
   * people.get() // { 1: {name: 'John'}, 2: {name: 'Martha'} }
   *
   * // Change collection´s values (updates can be partial)
   * people.value = { 1: {name: John, job: 'News Reporter'} }
   * // people.value -> { 1: {name: 'John, job: 'News Reporter'}, 2: {name: 'Martha'} }
   * people.set({ 1: {name: John, job: 'News Reporter'} })
   * // people.value -> { 1: {name: 'John, job: 'News Reporter'}, 2: {name: 'Martha'} }
   *
   * // Add to collection
   * people.add({ 3: atom({name: 'Jess'}), ... })
   * // people.value -> { 1: {name: 'John, job: 'News Reporter'}, 2: {name: 'Martha'}, 3: {name: 'Jess'} }
   *
   * // Remove from collection (by id(s))
   * people.remove("1")
   * people.remove(["2", "3"])
   *
   * // Listen on changes
   * people.subscribe(({ key, value }) => ...)
   * people.unsubscribe(({ key, value }) => ...)
   * ```
   */
  constructor(atomsByKey: AtomsByKey<Value> = {}) {
    super();

    this.add(atomsByKey);

    // Binds
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /**
   * Return collection´s value
   * @example
   * ```js
   * .value // { x: 42, y: 23 }
   * ```
   */
  get value(): AtomValuesByKey<Value> {
    return this.#value;
  }

  /**
   * Partially update existing values
   * @example
   * ```js
   * .value = { x: 5, y: (y) => y + 15 }
   * ```
   */
  set value(valuesByKey: AtomValuesByKey<Value>) {
    this.set(valuesByKey);
  }

  /**
   * Return collection´s value
   * @example
   * ```js
   * .get() // { x: 42, y: 23 }
   * ```
   */
  get(): AtomValuesByKey<Value> {
    return this.#value;
  }

  /**
   * Partially update existing values
   *
   * IMPORTANT: Does not allow to add new atoms! If you want to add a new atom, use .add(...) instead.
   * @example
   * ```js
   * .set({ x: 5, y: (y) => y + 15 })
   * ```
   * @param {AtomValuesByKey<Value>} valuesByKey
   */
  set(valuesByKey: AtomValuesByKey<Value>): this {
    Object.keys(valuesByKey)
      .forEach((key) => {
        if (!this.#atoms[key]) return
        this.#atoms[key].set(valuesByKey[key]);
      });
    return this;
  }

  /**
   * Return collection keys
   * @example
   * ```js
   * .keys // ['x', 'y']
   * ```
   */
  get keys(): string[] {
    return Object.keys(this.#atoms);
  }

  /**
   * Return single atom by key path or null if not found
   * @example
   * ```js
   * .one('users') // collection({'10f2d975': atom({name: 'John'}), ...})
   * .one(['users', '10f2d975']) // atom({name: 'John'})
   * .one('users.10f2d975') // atom({name: 'John'})
   * ```
   * @param {string|string[]} key
   */
  one(key: string | string[]): IAtom<Value> | null {
    const [path, ...paths] = Array.isArray(key) ? key : key.split('.');
    const atom = this.#atoms[path];
    if (!atom) return null;
    if (!paths.length) return atom;
    if (atom instanceof Collection) return atom.one(paths);
    return null;
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
   * Add atom(s)
   * @example
   * ```js
   * .add({ z: atom(42), ... })
   * ```
   */
  add(atomsByKey: AtomsByKey<Value>): this {
    Object.keys(atomsByKey).forEach((key) => {
      // Check if the key already exists and if it does then unsubscribe from the atom (override)
      if (this.#atoms[key]) this.#meta[key].unsubscribe();
      // Add new observable
      const atom = atomsByKey[key];
      this.#atoms[key] = atom;
      this.#value[key] = atom.value;

      const unsubscribe = atom.subscribe((value) => {
        // Create a new reference for immutability
        this.#value = {...this.#value, [key]: value};
        this.emit('update', this.#value);
      });

      this.#meta[key] = this.#meta[key] || {};
      this.#meta[key].unsubscribe = unsubscribe;
      this.emit('update', this.#value);
    });
    return this;
  }

  /**
   * Remove atom(s) from collection
   * @example
   * ```js
   * .remove("x")
   * .remove(["x", "y", ...])
   * ```
   * @param {string | string[]} key
   */
  remove(key: string | string[]): this {
    // Array of keys
    if (Array.isArray(key)) {
      // eslint-disable-next-line no-shadow
      key.forEach((key) => {
        const atom = this.#atoms[key];
        if (!atom) return;
        this.#meta[key].unsubscribe();
        this.#value = {...this.#value}
        delete this.#value[key]
        delete this.#atoms[key];
        delete this.#meta[key];
        this.emit('update', this.#value);
      });
      return this;
    }

    // Single key
    if (!this.#atoms[key]) return this;
    const atom = this.#atoms[key];
    if (!atom) return this;
    this.#meta[key].unsubscribe();
    this.#value = {...this.#value}
    delete this.#value[key]
    delete this.#meta[key];
    delete this.#atoms[key];
    this.emit('update', this.#value);
    return this;
  }

  /**
   * Upsert atom(s)
   * IMPORTANT: Only atom values are updated and not the atom reference -> so changing the value of the
   * passed atom (e.g. `x: atom(42)`) later will not affect the collection value, but it will in case atom
   * was inserted.
   * @example
   * ```js
   * .upsert({ x: atom(42), y: atom(30), ... })
   * ```
   */
  upsert(atomsByKey: AtomsByKey<Value>): this {
    Object.keys(atomsByKey).forEach((key) => {
      const atom = this.#atoms[key];
      // Add
      if (!atom) {
        this.add({ [key]: atomsByKey[key] });
        return;
      }
      // Update
      atom.set(atomsByKey[key].value);
    });
    return this;
  }

  /**
   * Sync collection - add missing atoms, remove extra, update existing atom's values
   * IMPORTANT: Only atom values are updated and not the atom reference -> so changing the value of the
   * passed atom (e.g. `x: atom(42)`) later will not affect the collection value, but it will in case atom
   * was inserted.
   * @example
   * ```js
   * .sync({ x: atom(42), ... })
   * ```
   */
  sync(atomsByKey: AtomsByKey<Value>): this {
    [...this.keys, ...Object.keys(atomsByKey)].forEach((key) => {
      const observable = atomsByKey[key];
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
   * Remove all atoms but keep your subscriptions on the collection
   */
  reset(): this {
    Object.keys(this.#meta).forEach((key) => {
      this.#meta[key].unsubscribe();
    });
    this.#value = {};
    this.#atoms = {};
    this.#meta = {};
    return this;
  }

  /**
   * Subscribe to updates on any of the observables
   */
  subscribe(fn: Listener<AtomValuesByKey<Value>>): Unsubscribe {
    return this.on('update', fn);
  }

  /**
   * Unsubscribe
   */
  unsubscribe(fn: Listener<AtomValuesByKey<Value>>): this {
    return this.off('update', fn);
  }

  /**
   * Create static observable collection
   * @example
   * ```js
   * Collection.from({ x: 5, y: 27, z: 42 })
   * ```
   * @param {AtomValuesByKey<TValue>} values
   */
  static from<TValue>(values: AtomValuesByKey<TValue>): Collection<TValue> {
    return new Collection(
      Object.keys(values).reduce(
        (accumulator, key) => ({ ...accumulator, [key]: Atom.from(values[key]) }),
        {}
      )
    );
  }
}

export default Collection;
