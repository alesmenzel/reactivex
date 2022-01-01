/* eslint-disable import/no-extraneous-dependencies */
import { useLayoutEffect, useDebugValue } from "react";
import useForceUpdate from "./use-force-update";
import createBatcher from "./create-batcher";
import type { IAtom } from "../core/atom";

export type UseObservableOutput<TValue> = [TValue, (value: TValue) => IAtom<TValue>]

/**
 * Subscribe to observable and update React component on any changes
 * ```js
 * // state.js
 * const count = Observable.from(0)
 * export default count
 *
 * // logic.js
 * import count from './state.js'
 * count.set(count => count + 1) // increment from anywhere
 *
 * // component.js
 * import count from './state.js'
 *
 * const Counter = () => {
 *   useObservable(count)
 *
 *   return <div>{count}</div>
 * }
 * ```
 * @param {IAtom<TValue>} observable
 */
function useObservable<TValue>(observable: IAtom<TValue>): UseObservableOutput<TValue> {
  useDebugValue(() => observable.value);
  const update = useForceUpdate();

  useLayoutEffect(() => {
    // Batch updates so we only re-render React once for multiple simultaneous changes
    const { listener, abort } = createBatcher(update);
    observable.subscribe(listener);

    return () => {
      observable.unsubscribe(listener);
      abort();
    };
  }, [observable, update]);

  return [observable.value, observable.set];
}

export default useObservable;
