/** An optional button inside the toast, e.g. Undo. Pressing it also closes the toast. */
export default interface ToastAction {
  label: string;
  onClick: () => void;
}
