import type { ReactNode } from 'react';
import BrandMark from '../components/brand_mark';
import useAuthStore from '../store/auth_store';

/** Holds the app back (logo only) until we know who is signed in, so no page flashes the wrong state. */
export default function BootGate({ children }: { children: ReactNode }) {
  const loading = useAuthStore((state) => state.me === undefined);
  if (loading) {
    return (
      <div role="status" aria-label="Loading" className="grid min-h-dvh place-items-center bg-canvas">
        <BrandMark />
      </div>
    );
  }
  return <>{children}</>;
}
