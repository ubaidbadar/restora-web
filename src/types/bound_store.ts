/** What `createStore` returns: a hook to read the store in components, plus `getState`/`setState` for everything else. */
export default interface BoundStore<T> {
(): T;
  <S>(selector: (state: T) => S): S;
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => () => void;
}
