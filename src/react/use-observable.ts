import { useLayoutEffect, useDebugValue } from "react";
import useForceUpdate from "./use-force-update";
import createBatcher from "./create-batcher";
import { IObservable } from "../core/observable";

/**
 * Subscribe to observable and update React component on any changes
 */
function useObservable<TValue>(observable: IObservable<TValue>) {
  useDebugValue(() => observable.value);
  const update = useForceUpdate();

  useLayoutEffect(() => {
    // Batch updates so we only re-render React once for multiple simultaneous changes
    const { listener, abort } = createBatcher(update);
    observable.subscribe(listener);

    return () => {
      abort();
      observable.unsubscribe(listener);
    };
  }, [observable, update]);

  return [observable.value, observable.set];
}

export default useObservable;
