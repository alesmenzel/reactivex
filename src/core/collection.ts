import Atom, { atom } from './atom';
import EventEmitter, { Listener, Unsubscribe } from './event-emitter';
import { AtomValuesByKey, AtomsByKey, AtomsOrValuesByKey, IAtom, SetFn } from "./types"
import { AtomSymbol } from './constants';
import { isSetFn } from "./utils"

export type CollectionEvents<Value> = {
  update: AtomValuesByKey<Value>
}

/**
 * Collection is an observable container of multiple observable values.
 * Whenever one of the values changes the collection is changed as well.
 */
class Collection<Value>
extends EventEmitter<CollectionEvents<Value>> implements IAtom<AtomValuesByKey<Value>> {
  [AtomSymbol]: true

  _value: AtomValuesByKey<Value> = {}

  _atoms: AtomsByKey<Value> = {}

  _meta: { [key: string]: { unsubscribe: () => void } } = {}

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

    Object.keys(atomsByKey).forEach(key => this._addAtom(key, atomsByKey[key]))

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
    return this._value;
  }

  /**
   * Partially update existing values
   * @example
   * ```js
   * .value = { x: 5, y: y: 15 }
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
    return this._value;
  }

  /**
   * Partially update values, in case atom with such id doesnt exist, it will be created
   * @example
   * ```js
   * .set({ x: 5, y: y: 15 })
   * .set(({x, y}) => ({ x: 5, y: y + 15 }))
   * ```
   */
  set(value: AtomValuesByKey<Value> | SetFn<AtomValuesByKey<Value>>): this {
    const valuesByKey: AtomValuesByKey<Value> = isSetFn(value) ? value(this._value) : value;

    Object.keys(valuesByKey)
      .forEach((key) => {
        if (!this._atoms[key]) {
          this._addAtom(key, atom(valuesByKey[key]));
          return
        }
        this._atoms[key].set(valuesByKey[key]);
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
    return Object.keys(this._atoms);
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
    const atom = this._atoms[path];
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
   * Add an atom to collection
   */
  _addAtom(key: string, atom: IAtom<Value>) {
    // Check if the key already exists and if it does then unsubscribe from the atom (override)
    if (this._atoms[key]) this._meta[key].unsubscribe();

    this._atoms[key] = atom;
    this._value[key] = atom.value;

    const unsubscribe = atom.subscribe((value) => {
      // Create a new reference for immutability
      this._value = {...this._value, [key]: value};
      this.emit('update', this._value);
    });

    this._meta[key] = this._meta[key] || {};
    this._meta[key].unsubscribe = unsubscribe;
    this.emit('update', this._value);
  }

  /**
   * Remove atom from collection by key
   */
  _removeAtomByKey(key: string) {
    const atom = this._atoms[key];
    if (!atom) return;
    this._meta[key].unsubscribe();
    this._value = {...this._value}
    delete this._value[key]
    delete this._atoms[key];
    delete this._meta[key];
    this.emit('update', this._value);
  }

  /**
   * Remove atom(s) from collection
   * @example
   * ```js
   * .remove("x")
   * .remove(["x", "y", ...])
   * ```
   * @param {string | string[]} keys
   */
  remove(keys: string | string[]): this {
    if (Array.isArray(keys)) {
      keys.forEach((key) => this._removeAtomByKey(key));
      return this
    }

    this._removeAtomByKey(keys)
    return this;
  }

  /**
   * Sync collection - add missing atoms, remove extra, replace existing atoms
   * @example
   * ```js
   * .sync({ x: atom(42), ... })
   * ```
   */
  sync(atomsByKey: AtomsByKey<Value>): this {
    [...this.keys, ...Object.keys(atomsByKey)].forEach((key) => {
      const atom = atomsByKey[key];
      // Atom does not exit anymore
      if (!atom) {
        this.remove(key);
        return;
      }
      // Existing/new atom
      this._addAtom(key, atom);
    });
    return this;
  }

  /**
   * Remove all atoms but keep your subscriptions on the collection
   * @example
   * ```js
   * .reset()
   * ```
   */
  reset(): this {
    Object.keys(this._meta).forEach((key) => {
      this._meta[key].unsubscribe();
    });
    this._value = {};
    this._atoms = {};
    this._meta = {};
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
   * Create observable collection
   * @example
   * ```js
   * Collection.from({ x: atom(5), y: atom(27), z: atom(42) })
   * // You can also pass items directly and they will transformed into atoms
   * Collection.from({ x: 5, y: 27, z: 42 })
   * ```
   */
  static from<Value>(atomsByKey: AtomsOrValuesByKey<Value>): Collection<Value> {
    return new Collection(Object.keys(atomsByKey).reduce((acc, key) => {
      acc[key] = Atom.from(atomsByKey[key])
      return acc
    }, {} as AtomsByKey<Value>));
  }

  /**
   * Iterator iterates over the atoms
   */
  [Symbol.iterator] () {
    const {keys} = this

    let index = 0;
    return {
      next: () => {
        if (index < keys.length) {
          return {value: this._atoms[keys[index++]], done: false}
        }
        return {done: true}
      }
    }
  }
}

/**
   * Constructs a Collection
   * @example
   * ```
   * // Create a collection
   * const people = collection({
   *   // <id>: Atom<Value> | Value
   *   1: atom({name: 'John'}),
   *   2: {name: 'Martha'},
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
export function collection<Value>(atomsByKey: AtomsByKey<Value>): Collection<Value> {
  return Collection.from(atomsByKey)
}

export default Collection;
