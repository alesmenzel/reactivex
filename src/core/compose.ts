export interface ComposedFunction<TReturn> {
  (...args: TReturn[]): TReturn;
}

/**
 * Compose functions
 * First (last argument) function call can have any number of arguments,
 * other must have exactly one parameter, which is the return value
 * of the previous function call
 * @example
 * ```js
 * compose(
 *   (x) => x + 100, // 117,5
 *   (x) => x / 10, // 17,5
 *   (x, y, z) => x + y + z, // 175
 * )(100, 50, 25)
 * ```
 * @param  {...Function[]} functions
 */
function compose<TReturn>(
  firstFn: (...args: TReturn[]) => TReturn,
  ...functions: Array<(arg: TReturn) => TReturn>
): ComposedFunction<TReturn> {
  return functions.reduce((prevFn, nextFn) => (...args) => prevFn(nextFn(...args)), firstFn);
}

export default compose;
