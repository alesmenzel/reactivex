export interface Flush<TListenerArg> {
  (calls: TListenerArg[][]): void;
}

export interface Batcher<TListenerArg> {
  listener(...args: TListenerArg[]): void;
  abort(): void;
}

/**
 * Batch calls in given time window and then flush them
 * @example
 * ```js
 * const onFlush = (...args) => {
 *   console.log('Flushed', args) // Called after timeout
 * }
 * const timeout = 100 // ms
 * const batcher = createBatcher(onFlush, timeout)
 *
 * batcher.listener('some', 'args')
 * batcher.listener('some', 'args')
 * batcher.listener('some', 'args')
 * // flush after 100ms passed
 * batcher.listener('some', 'args')
 * // ...
 * batcher.abort()
 * ```
 * @param {Flush<TListenerArg>} flush
 * @param {number} [timeout=0]
 */
function createBatcher<TListenerArg>(flush: Flush<TListenerArg>, timeout = 0): Batcher<TListenerArg> {
  let calls: TListenerArg[][] = [];
  let timeoutId: number | undefined;

  function listener(...args: TListenerArg[]) {
    calls.push(args);
    if (timeoutId) return;
    // @ts-ignore ts bullshit
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      flush(calls);
      calls = [];
    }, timeout);
  }

  function abort() {
    if (timeoutId) clearTimeout(timeoutId);
  }

  return { listener, abort };
}

export default createBatcher;
