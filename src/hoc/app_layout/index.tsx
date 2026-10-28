import { Outlet, useNavigate } from 'react-router';
import BottomNav from './bottom_nav';
import SideNav from './side_nav';
import TableCallsBanner from './table_calls_banner';
import LiveUpdates from './live_updates';
import { useEffect, useEffectEvent } from 'react';
import useAuthStore from '../../store/auth_store';
import can from '@shared/can';
import Can from '../../components/can';
import PosIdleLock from './pos_idle_lock';
import SyncStatus from './sync_status';
import useBreakpoint from '../../hooks/useBreakpoint';
import api from '../../config/api';

/** Sidebar on desktop, bottom bar on phones and tablets: only the one in use is rendered. */
export default function AppLayout() {
  const navigate = useNavigate();
  const { lg } = useBreakpoint();
  const me = useAuthStore((state) => state.me);
  // Pages start again (and load fresh data) when the restaurant or branch changes.
  const place = `${me?.workplace?.restaurant._id}:${me?.workplace?.branch?._id}`;
  const TYPING = 'input, textarea, select, [contenteditable="true"]';

  const onKey = useEffectEvent((event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.target instanceof Element && event.target.closest(TYPING)) return;
    if (event.key.toLowerCase() === 'n' && can(me?.workplace, 'orders:create')) {
      event.preventDefault();
      navigate('/orders/new');
    }
    if (event.key === '/') {
      const search = document.querySelector<HTMLInputElement>('[data-search]');
      if (!search) return;
      event.preventDefault();
      search.focus();
    }
  });

  // Alerts turned on in this browser follow the restaurant and branch open (the server moves them along).
  useEffect(() => {
    navigator.serviceWorker
      ?.getRegistration()
      .then((registration) => registration?.pushManager?.getSubscription())
      .then((subscription) => subscription && api.post('/push-devices', { kind: 'web', ...subscription.toJSON() }))
      .catch(() => {});
  }, [place]);

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKey(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
  return (
    <div className="bg-canvas font-body text-ink lg:ps-64">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:inset-s-2 focus:top-2 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
        Skip to content
      </a>
      {lg && <SideNav />}
      <main id="main" className="mx-auto min-h-dvh w-full max-w-7xl flex flex-col px-4 pt-5 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
        <SyncStatus />
        <Can permission="tables:view">
          <TableCallsBanner key={place} />
        </Can>
        <div key={place} className="contents">
          <Outlet />
        </div>
      </main>
      <Can permission="orders:view">
        <LiveUpdates key={place} />
      </Can>
      {me?.device && <PosIdleLock seconds={me.device.settings.idleLockSeconds} />}
      {!lg && <BottomNav />}
    </div>
  );
}
