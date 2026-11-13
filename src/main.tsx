import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, useRouteError } from 'react-router';
import { registerSW } from 'virtual:pwa-register';
import useAuthStore from './store/auth_store';
import ErrorBoundary from './ui/error_boundary';
import ToastContainer from './ui/toast_container';
import App from './app';
import toast from './utils/toast';

import './index.css';
import type Me from '@shared/me';
import api from './config/api';
import getCache from './store/get_cache';
import useOutboxStore from './store/outbox_store';
import type OutboxState from './types/outbox_state';
import offlineDb from './utils/offline_db';
import syncOutbox from './utils/sync_outbox';
import applyAppearance from './utils/apply_appearance';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}


const ErrorBoundaryWrapper = () => {
  const error = useRouteError();
  return  <ErrorBoundary error={error} />
}

const router = createBrowserRouter([
  {
    path: '*',
    element: <App />,
    errorElement: <ErrorBoundaryWrapper />,
  },
]);

// The PWA reuses its most recently active window. Keep deep links working, but
// ignore a plain app launch so opening the PC Agent never resets an order in progress.
const launchQueue = (window as Window & {
  launchQueue?: { setConsumer: (consumer: (params: { targetURL: string }) => void) => void };
}).launchQueue;
launchQueue?.setConsumer(({ targetURL }) => {
  try {
    const target = new URL(targetURL);
    if (target.origin !== window.location.origin || (target.pathname === '/' && !target.search && !target.hash)) return;
    const path = `${target.pathname}${target.search}${target.hash}`;
    if (path !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      void router.navigate(path);
    }
  } catch {
    // Ignore malformed or external launch targets.
  }
});

// Start: what this device saved last time (the answers screens showed, the outbox), then who is signed in. Without
// internet the last `/me` saved here keeps the person signed in, so the orders screen works offline.
Promise.all([getCache.load(), offlineDb.get<Pick<OutboxState, 'items' | 'savedIds'>>('outbox').then((saved) => saved && useOutboxStore.setState(saved))])
  .then(() => api.get<Me>('/me'))
  .then((res) => useAuthStore.getState().setMe(res.data))
  .catch(async (err) => {
    // A 401 was already handled by the api interceptor (signed out, or a locked terminal).
    if (useAuthStore.getState().me !== undefined) return;
    const saved = err.response ? undefined : await offlineDb.get<Me>('me');
    useAuthStore.getState().setMe(saved ?? null);
  })
  .finally(() => void syncOutbox());

// Who is signed in is kept on the device for the next offline start; signing out forgets it and every saved answer.
useAuthStore.subscribe(() => {
  const { me } = useAuthStore.getState();
  applyAppearance(me?.workplace?.settings.appearance);
  if (me) void offlineDb.set('me', me);
  if (me === null) {
    void offlineDb.set('me', null);
    getCache.clear();
  }
});

// Back online: send what waited. While anything waits, try every 30 seconds too (the online event is not always fired).
window.addEventListener('online', () => {
  useOutboxStore.getState().setOnline(true);
  void syncOutbox();
});
window.addEventListener('offline', () => useOutboxStore.getState().setOnline(false));
window.setInterval(() => useOutboxStore.getState().items.length && void syncOutbox(), 30_000);


const UPDATE_CHECK_MS = 60 * 60 * 1000;

// The service worker keeps the built app on the device (production only). On the dev server it must not exist: one left
// from a production build on this address would keep serving that old build, so every normal refresh showed old code.
if (import.meta.env.DEV) {
  void navigator.serviceWorker?.getRegistrations().then((registrations) => registrations.forEach((registration) => void registration.unregister()));
} else {
  const updateServiceWorker = registerSW({
    onNeedRefresh() {
      toast.info('A new version of Restora is ready.', { label: 'Update', onClick: () => void updateServiceWorker(true) });
    },
    onRegisteredSW(_url, registration) {
      if (registration) window.setInterval(() => void registration.update(), UPDATE_CHECK_MS);
    },
  });
}

createRoot(rootElement).render(
  <StrictMode>
    <ToastContainer />
    <RouterProvider router={router} />
  </StrictMode>,
);
