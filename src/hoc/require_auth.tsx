import { Navigate, Outlet, useLocation } from 'react-router';
import useAuthStore from '../store/auth_store';

/** Signed-in pages. Nobody signed in: to sign in, coming back here after. A locked POS terminal: to its lock screen. */
export default function RequireAuth() {
  const { me, terminal } = useAuthStore();
  const location = useLocation();
  if (me) return <Outlet />;
  if (terminal) return <Navigate to="/pos" replace />;
  const next = `${location.pathname}${location.search}`;
  return <Navigate to={next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}`} replace />;
}
