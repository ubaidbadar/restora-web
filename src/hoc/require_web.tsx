import { Navigate, Outlet } from 'react-router';
import useAuthStore from '../store/auth_store';

/** Pages for someone's own sign-in, never for a shared POS terminal (accounts, restaurants, settings). */
export default function RequireWeb() {
  const onTerminal = useAuthStore((state) => state.me?.mode === 'pos');
  return onTerminal ? <Navigate to="/orders/new" replace /> : <Outlet />;
}
