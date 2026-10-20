import type ConfirmPanelProps from '../../types/confirm_panel_props';
import Button from '../button';
import Modal from '../modal';

/** Presentational confirm dialog; `ConfirmModal` and `AlertModal` wrap it with `withOverlay`. */
export default function ConfirmPanel({
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  cancelText = 'Cancel',
  isConfirming = false,
  confirmingText = 'Processing...',
  ...overlay
}: ConfirmPanelProps) {
  return (
    <Modal
      {...overlay}
      title={title}
      footer={(close) => (
        <>
          <Button variant="ghost" onClick={close} disabled={isConfirming}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={() => {
              onConfirm();
              close();
            }}
            disabled={isConfirming}
          >
            {isConfirming ? confirmingText : confirmText}
          </Button>
        </>
      )}
    >
      <div className="text-sm text-body">{description}</div>
    </Modal>
  );
}

