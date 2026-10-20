import type ToastAction from './toast_action';
import type ToastMessage from './toast_message';
import type ToastType from './toast_type';

export default interface ToastState {
  toasts: ToastMessage[];
  show: (message: string, type: ToastType, action?: ToastAction) => void;
  dismiss: (id: string) => void;
}
