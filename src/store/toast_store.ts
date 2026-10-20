import type ToastState from '../types/toast_state';
import createStore from './create_store';

const TOAST_DURATION = 4000;
// Long enough to read the message and reach the button.
const ACTION_TOAST_DURATION = 7000;
const timers = new Map<string, number>();
let lastId = 0;

/** The toasts on screen and the actions that add and remove them. `utils/toast` is the short way to call `show`. */
const useToastStore = createStore<ToastState>((set, get) => ({
  toasts: [],
  show(message, type, action) {
    // A counter, not crypto.randomUUID(): that only exists in secure contexts, and the dev server is also opened over LAN http.
    const id = `toast-${++lastId}`;
    set((state) => ({ toasts: [...state.toasts, { id, type, message, action }] }));
    timers.set(id, window.setTimeout(() => get().dismiss(id), action ? ACTION_TOAST_DURATION : TOAST_DURATION));
  },
  dismiss(id) {
    window.clearTimeout(timers.get(id));
    timers.delete(id);
    if (get().toasts.some((t) => t.id === id)) set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

export default useToastStore;
