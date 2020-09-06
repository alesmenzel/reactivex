import { useReducer } from 'react';

function reducer(state: boolean): boolean {
  // Prevents too many objects garbage collection by swapping boolean value
  return !state;
}

/**
 * Force update a React component
 */
export default function useForceUpdate(): () => void {
  const [, update] = useReducer(reducer, false);
  return update;
}
