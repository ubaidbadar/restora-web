import type { ReactNode } from 'react';
import type ButtonProps from './button_props';
import type OverlayProps from './overlay_props';

export default interface ConfirmPanelProps extends OverlayProps {
  /** Called when the user confirms; the dialog closes right after. */
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  confirmVariant?: ButtonProps['variant'];
  cancelText?: string;
  isConfirming?: boolean;
  confirmingText?: string;
}
