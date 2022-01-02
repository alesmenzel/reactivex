export interface Flush<ListenerArg> {
  (calls: ListenerArg[][]): void;
}

export interface Batcher<ListenerArg> {
  listener(...args: ListenerArg[]): void;
  abort(): void;
}

/**
 * Batch calls in given time window and then flushes them
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
 */
function createBatcher<ListenerArg>(flush: Flush<ListenerArg>, timeout = 0): Batcher<ListenerArg> {
  let calls: ListenerArg[][] = [];
  let timeoutId: number | undefined;

  function listener(...args: ListenerArg[]) {
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
