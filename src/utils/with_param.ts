/**
 * The search params with one value set (or removed when empty or the fallback), for `setParams((prev) => withParam(prev, 'q', text))`.
 * Starts from the address bar as it is now, not `prev`: a search box calls this after its delay, with a `prev` from
 * before a chip was tapped, and would undo that tap.
 */
export default function withParam(_prev: URLSearchParams, key: string, value: string, fallback = '') {
  const next = new URLSearchParams(window.location.search);
  if (value && value !== fallback) next.set(key, value);
  else next.delete(key);
  return next;
}
