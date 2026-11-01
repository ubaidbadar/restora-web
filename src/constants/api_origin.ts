// `vite dev` proxies /api to VITE_API_URL (vite.config.ts), so in development the browser stays on its own address.
const apiOrigin = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export default apiOrigin;
