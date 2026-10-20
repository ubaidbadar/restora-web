import { Navigate, Outlet, useSearchParams } from 'react-router';
import useAuthStore from '../store/auth_store';
import safeNext from '../utils/safe_next';

/** Sign in and sign up: someone already signed in goes on, unless they are adding another account (`?add=1`). */
export default function GuestOnly() {
  const signedIn = useAuthStore((state) => Boolean(state.me));
  const [params] = useSearchParams();
  if (signedIn && params.get('add') !== '1') return <Navigate to={safeNext(params.get('next'))} replace />;
  return <Outlet />;
}
