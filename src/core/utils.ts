/* eslint-disable import/prefer-default-export */

/**
 * Compare given values strictly by reference
 */
export function strictEqual<Value>(prevValue: Value, currValue: Value): boolean {
  return prevValue === currValue
}
