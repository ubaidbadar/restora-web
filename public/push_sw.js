// Web push for guests' orders and calls, loaded into the app's service worker (vite.config.ts, workbox.importScripts).
// The server sends { title, body, screen, tag }. While Restora is the window in front, the live stream has already
// chimed and shown a toast, so nothing more is shown.
const SCREENS = { orders: '/orders', tables: '/tables' };

self.addEventListener('push', (event) => {
  const alert = event.data ? event.data.json() : {};
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      if (windows.some((window) => window.focused)) return undefined;
      return self.registration.showNotification(alert.title || 'Restora', {
        body: alert.body,
        tag: alert.tag,
        icon: '/pwa-192.png',
        badge: '/pwa-64.png',
        data: { url: SCREENS[alert.screen] || '/orders' },
      });
    }),
  );
});

// A tap opens its page: in a Restora window already open, or a new one.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/orders';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
      const open = windows[0];
      if (!open) return self.clients.openWindow(url);
      return open.focus().then((window) => window.navigate(url));
    }),
  );
});
