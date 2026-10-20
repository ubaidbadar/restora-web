import type ConfirmPanelProps from '../../types/confirm_panel_props';
import ConfirmPanel from '../confirm_modal';

/** A ConfirmModal preset for destructive actions. */
export default function AlertPanel({
  confirmText = 'Delete',
  confirmVariant = 'danger',
  confirmingText = 'Confirming...',
  ...props
}: ConfirmPanelProps) {
  return (
    <ConfirmPanel
      {...props}
      confirmText={confirmText}
      confirmVariant={confirmVariant}
      confirmingText={confirmingText}
    />
  );
}
