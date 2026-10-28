/** The public site (restora.live): table QR codes open their guest menu there. */
const siteUrl = (import.meta.env.VITE_API_PROXY || 'https://restora.live').replace(/\/$/, '');

export default siteUrl;
