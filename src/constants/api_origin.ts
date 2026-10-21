const apiOrigin = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export default apiOrigin;
