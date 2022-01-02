/* eslint-disable import/no-extraneous-dependencies */
import { useLayoutEffect, useDebugValue } from "react";
import useForceUpdate from "./use-force-update";
import createBatcher from "./create-batcher";
import type { IAtom } from "../core/types";

export type UseAtomOutput<Value> = [Value, IAtom<Value>['set']]

/**
 * Subscribe to an atom and update React component on when the atom's value changes
 * ```js
 * // state.js
 * const countAtom = atom(0)
 * export default countAtom
 *
 * // logic.js (e.g. Saga)
 * import countAtom from './state.js'
 * countAtom.set(count => count + 1) // increment from anywhere
 *
 * // component.js (UI)
 * import countAtom from './state.js'
 *
 * const Counter = () => {
 *   const [count, setCount] = useAtom(countAtom)
 *
 *   return <div>{count}</div>
 * }
 * ```
 */
function useAtom<Value>(atom: IAtom<Value>): UseAtomOutput<Value> {
  useDebugValue(() => atom.value);
  const update = useForceUpdate();

  useLayoutEffect(() => {
    // Batch updates so we only re-render React once for multiple simultaneous changes
    const { listener, abort } = createBatcher(update);
    atom.subscribe(listener);

    return () => {
      atom.unsubscribe(listener);
      abort();
    };
  }, [atom, update]);

  return [atom.value, atom.set];
}

export default useAtom;
