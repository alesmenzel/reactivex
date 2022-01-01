import EventEmitter, {Listener, Unsubscribe} from './event-emitter';
import { strictEqual } from './utils';

export type AtomEvents<Value> = {
  update: Value
}

export type SetFn<Value> = (prevValue: Value) => Value
export interface IAtom<Value> {
  value: Value;
  get(): Value;
  set(value: Value | SetFn<Value>): this;
  subscribe(listener: Listener<Value>): Unsubscribe;
  unsubscribe(listener: Listener<Value>): this;
}

export type AtomOptions<Value> = {
  isEqual?: (prevValue: Value, currValue: Value) => boolean
}

/**
 * Observale value container that emits an update event whenever the value is changed
 */
class Atom<Value> extends EventEmitter<AtomEvents<Value>> implements IAtom<Value> {
  #value: Value;

  #options: AtomOptions<Value>;

  /**
   * Construct Atom
   * @example
   * ```js
   * const count = new Atom(42) // default uses strict reference equality
   * const count = new Atom(42, {
   *   isEqual: _.isEqual // lodash's deep equal
   * })
   *
   * // Read atom´s value
   * count.value // 42
   * count.get() // 42
   *
   * // Change atom´s value
   * count.value = 100 // count.value -> 100
   * count.set(150) // count.value -> 150
   * count.set((prevValue) => prevValue + 150) // count.value -> 300
   *
   * // Listen on changes
   * count.subscribe((value) => ...)
   * count.unsubscribe((value) => ...)
   * ```
   */
  constructor(value: Value, options: AtomOptions<Value> = {}) {
    super();

    this.#value = value;
    this.#options = {
      isEqual: strictEqual,
      ...options
    };
    // Binds
    this.get = this.get.bind(this);
    this.set = this.set.bind(this);
    this.subscribe = this.subscribe.bind(this);
    this.unsubscribe = this.unsubscribe.bind(this);
  }

  /**
   * Return atom´s value
   * @example
   * ```js
   * atom.value // 42
   * ```
   */
  get value(): Value {
    return this.get();
  }

  /**
   * Set atom´s value
   * @example
   * ```js
   * atom.value = 42
   * ```
   */
  set value(value: Value) {
    this.set(value);
  }

  /**
   * Return atom´s value
   * @example
   * ```js
   * atom.get() // 42
   * ```
   */
  get(): Value {
    return this.#value;
  }

  /**
   * Set atom´s value
   * @example
   * ```js
   * atom.set(42)
   * atom.set((prevValue) => 42)
   * ```
   */
  set(value: Value): this {
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
   * const listener = (value) => {
   *   // ...
   * }
   * atom.subscribe(listener)
   * ```
   */
  subscribe(fn: Listener<Value>): Unsubscribe {
    return this.on('update', fn);
  }

  /**
   * Unsubscribe from listening on changes
   * @example
   * ```js
   * const listener = (value) => {
   *   // ...
   * }
   * atom.unsubscribe(listener)
   * ```
   */
  unsubscribe(fn: Listener<Value>): this {
    return this.off('update', fn);
  }

  /**
   * Factory for creating an atom
   * @example
   * ```js
   * Atom.from(42)
   * ```
   */
  static from<Value>(value: Value, options?: AtomOptions<Value>): Atom<Value> {
    return new Atom(value, options);
  }
}

/**
 * Create an atom
 * @example
 * ```js
 * const count = atom(42)
 * const count = atom(42, {
 *   isEqual: _.isEqual // lodash's deep equal
 * })
 *
 * // Read atom´s value
 * count.value // 42
 * count.get() // 42
 *
 * // Change atom´s value
 * count.value = 100 // count.value -> 100
 * count.set(150) // count.value -> 150
 * count.set((prevValue) => prevValue + 150) // count.value -> 300
 *
 * // Listen on changes
 * count.subscribe((value) => ...)
 * count.unsubscribe((value) => ...)
 * count.on('update', (value) => ...)
 * ```
 * ```
 */
export function atom<Value>(value: Value, options?: AtomOptions<Value>): Atom<Value> {
  return new Atom(value, options)
}

export default Atom;
