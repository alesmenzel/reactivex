/* eslint-disable no-unused-vars */
export interface Flush<TCall> {
  (calls: TCall[][]): void;
}

interface Batcher<TCall> {
  listener(...args: TCall[]): void;
  abort(): void;
}

/**
 * Batch calls in given time window and then flush them
 * @param {(...any[]) => void} flush
 * @param {number} [timeout=0]
 */
function createBatcher<TCall>(flush: Flush<TCall>, timeout = 0): Batcher<TCall> {
  let calls: TCall[][] = [];
  let timeoutId: number | undefined;

  function listener(...args: TCall[]) {
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
