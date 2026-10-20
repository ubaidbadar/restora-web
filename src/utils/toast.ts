import useToastStore from '../store/toast_store';
import type ToastAction from '../types/toast_action';

const show = (...args: Parameters<ReturnType<typeof useToastStore.getState>['show']>) => useToastStore.getState().show(...args);

/** `toast.success('Saved')`, `toast.info('Deleted', { label: 'Undo', onClick })`: shortcuts for `useToastStore`'s actions. */
const toast = {
  success: (message: string, action?: ToastAction) => show(message, 'success', action),
  error: (message: string, action?: ToastAction) => show(message, 'error', action),
  warning: (message: string, action?: ToastAction) => show(message, 'warning', action),
  info: (message: string, action?: ToastAction) => show(message, 'info', action),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};

export default toast;
