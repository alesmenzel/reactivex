/* eslint-disable import/no-extraneous-dependencies */
import { DispatchWithoutAction, useReducer } from 'react';

export function reducer(state: boolean): boolean {
  return !state;
}

/**
 * Force update a React component
 */
export default function useForceUpdate(): DispatchWithoutAction {
  const [, update] = useReducer(reducer, false);
  return update;
}
