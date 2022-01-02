import { AtomSymbol } from "./constants"
import { IAtom, SetFn } from "./types"

/**
 * Compare given values strictly by reference
 */
export function strictEqual<Value>(prevValue: Value, currValue: Value): boolean {
  return prevValue === currValue
}

/**
 * Check if instance is of type Atom
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isAtom<Value, Else = any>(value: IAtom<Value> | Else): value is IAtom<Value> {
  return typeof value === 'object' && AtomSymbol in value
}

/**
 * Check if value is a setter function
 */
export function isSetFn<Value> (value: Value | SetFn<Value>): value is SetFn<Value> {
  return typeof value === 'function'
}
