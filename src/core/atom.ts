import EventEmitter, { Listener, Unsubscribe } from './event-emitter';
import { AtomSymbol } from './constants';
import { isAtom, strictEqual, isSetFn } from './utils';
import {IAtom, SetFn} from "./types"

export type AtomEvents<Value> = {
  update: Value
}

export type AtomOptions<Value> = {
  isEqual: (prevValue: Value, currValue: Value) => boolean
}

/**
 * Observale value container that emits an update event whenever the value is changed
 */
class Atom<Value, Events extends AtomEvents<Value> = AtomEvents<Value>>
extends EventEmitter<Events> implements IAtom<Value> {
  [AtomSymbol]: true

  _value: Value

  _options: AtomOptions<Value> = {
    isEqual: strictEqual
  };

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
  constructor(value: Value, options: Partial<AtomOptions<Value>> = {}) {
    super();

    this._value = value
    this._options = {...this._options, ...options};
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
    return this._value
  }

  /**
   * Set atom´s value
   * @example
   * ```js
   * atom.value = 42
   * ```
   */
  set value(value: Value) {
    this.set(value)
  }

  /**
   * Return atom´s value
   * @example
   * ```js
   * atom.get() // 42
   * ```
   */
  get(): Value {
    return this._value
  }

  /**
   * Set atom´s value
   * @example
   * ```js
   * atom.set(42)
   * atom.set((prevValue) => prevValue + 42)
   * ```
   */
  set(value: Value | SetFn<Value>): this {
    const newValue: Value = isSetFn(value) ? value(this._value) : value;
    if (this._options.isEqual(this._value, newValue)) return this;
    this._value = newValue;
    this.emit('update', newValue);
    return this;
  }

  subscribe(listener: Listener<Value>): Unsubscribe {
    return this.on('update', listener)
  }

  unsubscribe(listener: Listener<Value>): this {
    return this.off('update', listener)
  }

  /**
   * Factory for creating an atom
   * @example
   * ```js
   * Atom.from(42)
   * // Can be also used to clone atoms
   * Atom.from(atom(42))
   * ```
   */
  static from<Value>(value: IAtom<Value> | Value, options?: AtomOptions<Value>): Atom<Value> {
    if (isAtom(value)) {
      value = value.value
    }
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
  return Atom.from(value, options)
}

export default Atom;
