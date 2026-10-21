/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  /** The app's own public address, without a trailing slash. Used by index.html's link previews. */
  readonly VITE_APP_URL?: string;
  /** The API's address in production, e.g. https://api.restora.live. Empty in dev (vite proxies /api). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
