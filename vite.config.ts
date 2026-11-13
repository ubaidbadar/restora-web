import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// Canvas token of src/index.css: behind the app, its splash screen and the phone's status bar.
const CANVAS = '#F6F7F9';
const DESCRIPTION = 'Orders, customers, khata and WhatsApp campaigns for your restaurant.';

export default defineConfig(({ command, mode }) => {
  // index.html's link previews need the app's full address. Set VITE_APP_URL in .env for production.
  const viteEnv = loadEnv(mode, '.', 'VITE_');
  if (command === 'build' && !viteEnv.VITE_API_URL?.trim()) {
    throw new Error('Set VITE_API_URL to the backend origin before building Restora (for example https://restora.live).');
  }
  const appUrl = viteEnv.VITE_APP_URL || 'http://localhost:3000';
  // The API (Bun + Hono) in development. The client calls relative /api/v1 and /uploads, so they are proxied there.
  const apiUrl = viteEnv.VITE_API_URL || 'http://localhost:5001';

  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      {
        name: 'app-url',
        transformIndexHtml: { order: 'pre', handler: (html: string) => html.replaceAll('%VITE_APP_URL%', appUrl) },
      },
      VitePWA({
        // A new version waits until the person taps Update (utils/register_service_worker.ts), so nothing half-typed is lost.
        registerType: 'prompt',
        injectRegister: false,
        includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
        manifest: {
          id: '/',
          name: 'Restora',
          short_name: 'Restora',
          description: DESCRIPTION,
          lang: 'en',
          dir: 'ltr',
          start_url: '/',
          scope: '/',
          display: 'standalone',
          // Native Restora Agent launches the installed PWA through a registered OS protocol.
          protocol_handlers: [{ protocol: 'web+restora', url: '/?restoraLaunch=%s' }],
          // A native PC Agent launch should focus an open Restora window without navigating away from an in-progress order.
          launch_handler: { client_mode: 'focus-existing' },
          orientation: 'any',
          background_color: CANVAS,
          theme_color: CANVAS,
          categories: ['business', 'food', 'productivity'],
          // Made by brand/build.mjs.
          icons: [
            { src: '/pwa-64.png', sizes: '64x64', type: 'image/png' },
            { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            { src: '/pwa-monochrome-512.png', sizes: '512x512', type: 'image/png', purpose: 'monochrome' },
          ],
          // Long-press the app icon. Pages every role can open.
          shortcuts: [
            { name: 'New order', url: '/orders/new', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
            { name: 'Customers', url: '/customers', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
            { name: 'Reservations', url: '/reservations', icons: [{ src: '/pwa-192.png', sizes: '192x192' }] },
          ],
          // Shown in Chrome's install window. Retake them when the dashboard changes a lot.
          screenshots: [
            { src: '/screenshots/dashboard-wide.jpg', sizes: '1280x800', type: 'image/jpeg', form_factor: 'wide', label: 'Today at a glance' },
            { src: '/screenshots/dashboard-narrow.jpg', sizes: '780x1688', type: 'image/jpeg', form_factor: 'narrow', label: 'Today at a glance' },
          ],
        },
        workbox: {
          // The app itself is kept for instant, flaky-network-proof starts.
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          globIgnores: ['screenshots/**', 'og-image.png'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
          // Alerts for guests' orders and calls (web push).
          importScripts: ['/push_sw.js'],
        },
      }),
    ],
    // Code shared with the server lives in the shared/ folder.
    resolve: { alias: { '@shared': fileURLToPath(new URL('./shared', import.meta.url)) } },
    // The production preview gets its own address, so its service worker never takes over the dev server's (3000).
    preview: { port: 4173 },
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/api': { target: apiUrl, changeOrigin: false },
        '/uploads': { target: apiUrl, changeOrigin: false },
      },
    },
  };
});

