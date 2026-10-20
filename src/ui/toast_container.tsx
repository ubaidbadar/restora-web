import useToastStore from '../store/toast_store';
import Toast from './toast';

/** Render once near the app root; `toast.*` can be called from anywhere. */
export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  // Always mounted: screen readers only announce changes inside a live region that already exists.
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed inset-x-4 bottom-(--toast-bottom) z-100 flex flex-col items-center gap-2 pointer-events-none sm:inset-x-auto sm:end-5 sm:items-end"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} />
      ))}
    </div>
  );
}
