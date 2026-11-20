# Restora POS — Windows desktop from restora-web

**Source of truth:** this repository's React application. The older `restora-desktop` repository is deprecated and is **not** used.

Run `yarn desktop:dev` to launch the existing Vite web app inside Tauri with the Rust printing engine, and `yarn desktop:build` for a Windows x64 NSIS setup EXE. Install Rust/MSVC Build Tools and WebView2 on Windows first. Regular `yarn dev`, `yarn build`, Firebase hosting, and the existing PWA remain unchanged.

In release builds, `yarn build` compiles **this repository's React code**. Tauri bundles `dist/` into the installer as `web/`; Windows WebView2 maps those local files to `https://app.restora.live`, preserving the app's existing origin, Better Auth HTTP-only session cookies, POS terminal cookies, and IndexedDB offline outbox. The app does not fetch a remote JavaScript bundle at launch. API requests still reach `https://restora.live` when online.

Windows printing is the in-process `restora-pc-agent` Rust library; no Electron, PowerShell, or separately installed agent is needed. It uses the system default printer for kinds not explicitly routed, with the backend pairing changes in Restora's companion backend branch. The old standalone agent must be quit because it holds TCP port 17777.

The app intentionally grants **no Tauri IPC capabilities** to website scripts. The native worker uses origin and host checks. `src-tauri/tauri.conf.json` declares Windows NSIS packaging and the bundled React resources.

**Limitations:** this is a Windows-only desktop target, and native receipts require a configured ESC/POS-compatible Windows printer. A network connection is still required for sign-in, sync, cloud actions and the backend print queue; offline orders use the existing outbox. OAuth through embedded WebView2 and direct navigation/refresh of arbitrary client-side deep routes need full interactive acceptance testing on a real Windows machine. The CI-built installer is unsigned.
