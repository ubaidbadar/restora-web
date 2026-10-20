import type { ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import type ToastMessage from '../types/toast_message';
import type ToastType from '../types/toast_type';
import toast from '../utils/toast';

// A white card for every type; the icon (shape and color) says which kind it is.
const toastStyles: Record<ToastType, { container: string; icon: ReactNode }> = {
  success: {
    container: '',
    icon: <CheckCircle2 className="text-success-600 shrink-0" size={20} aria-hidden="true" />,
  },
  error: {
    container: 'border-danger-200',
    icon: <AlertCircle className="text-danger-600 shrink-0" size={20} aria-hidden="true" />,
  },
  warning: {
    container: 'border-warning-200',
    icon: <AlertTriangle className="text-warning-600 shrink-0" size={20} aria-hidden="true" />,
  },
  info: {
    container: '',
    icon: <Info className="text-info-600 shrink-0" size={20} aria-hidden="true" />,
  },
};

export default function Toast({ id, type, message, action }: ToastMessage) {
  const style = toastStyles[type];

  return (
    <div
      className={`border border-border bg-surface shadow-lg rounded-control py-3 ps-4 pe-3 flex items-center gap-3 min-w-[min(20rem,calc(100vw-2rem))] max-w-[min(28rem,calc(100vw-2rem))] pointer-events-auto transition duration-300 starting:opacity-0 starting:translate-y-2 motion-reduce:transition-none ${style.container}`}
    >
      {style.icon}
      <span className="text-sm font-medium text-ink flex-1">{message}</span>
      {action && (
        <button
          type="button"
          onClick={() => {
            action.onClick();
            toast.dismiss(id);
          }}
          className="min-h-8 rounded-small px-2.5 text-sm font-semibold text-primary hover:bg-primary-soft cursor-pointer"
        >
          {action.label}
        </button>
      )}
      <button
        type="button"
        onClick={() => toast.dismiss(id)}
        className="grid size-8 shrink-0 place-items-center rounded-small text-muted hover:bg-hover hover:text-ink transition-colors cursor-pointer"
        aria-label="Close"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
