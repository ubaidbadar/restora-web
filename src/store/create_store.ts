import { useSyncExternalStore } from 'react';
import type BoundStore from '../types/bound_store';

type SetState<T> = BoundStore<T>['setState'];


export default function createStore<T>(init: (set: SetState<T>, get: () => T) => T): BoundStore<T> {
  const listeners = new Set<() => void>();
  let state: T;

  const getState = () => state;
  const setState: SetState<T> = (partial) => {
    const changes = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...changes };
    listeners.forEach((listener) => listener());
  };
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = init(setState, getState);

  function useBoundStore<S>(selector?: (state: T) => S) {
    const select = () => (selector ? selector(state) : state);
    return useSyncExternalStore(subscribe, select, select);
  }

  return Object.assign(useBoundStore, { getState, setState, subscribe }) as BoundStore<T>;
}
