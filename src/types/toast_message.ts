import type ToastAction from './toast_action';
import type ToastType from './toast_type';

export default interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
}
