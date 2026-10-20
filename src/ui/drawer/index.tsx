import { useId, type ReactNode } from 'react';
import type OverlayFooter from '../../types/overlay_footer';
import type OverlayProps from '../../types/overlay_props';
import DialogFooter from '../dialog_footer';
import DialogHeader from '../dialog_header';
import OverlayPanel from '../overlay_panel';

const widthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

type DrawerWidth = keyof typeof widthClasses;

interface DrawerProps extends OverlayProps {
  title?: string;
  children: ReactNode;
  footer?: OverlayFooter;
  width?: DrawerWidth;
}

export default function Drawer({ state, close, title, children, footer, width = 'md' }: DrawerProps) {
  const titleId = useId();

  return (
    <OverlayPanel
      state={state}
      close={close}
      from="right"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      className={`flex h-dvh w-full ${widthClasses[width]} flex-col bg-surface shadow-lg`}
    >
      <DialogHeader title={title} titleId={titleId} closeLabel="Close drawer" close={close} />
      <div className="flex flex-1 flex-col overflow-y-auto p-5 sm:p-6">{children}</div>
      {footer && <DialogFooter>{typeof footer === 'function' ? footer(close) : footer}</DialogFooter>}
    </OverlayPanel>
  );
}
