import { useEffect, useRef } from 'react';
import { useBlocker } from 'react-router';
import ConfirmPanel from '../ui/confirm_modal';

interface LeaveGuardProps {
  /** True while there are changes that would be lost. */
  when: boolean;
}

const nothing = () => {};

/** Asks before unsaved changes are thrown away, whether by a link in the app or by closing the tab. */
export default function LeaveGuard({ when }: LeaveGuardProps) {
  const blocker = useBlocker(when);
  const leaving = useRef(false);

  useEffect(() => {
    if (!when) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [when]);

  if (blocker.state !== 'blocked') return null;

  return (
    <ConfirmPanel
      state="active"
      open={nothing}
      close={() => !leaving.current && blocker.reset()}
      onConfirm={() => {
        leaving.current = true;
        blocker.proceed();
      }}
      title="Leave without saving?"
      description="You have changes on this page that are not saved yet. If you leave now they will be lost."
      confirmText="Leave"
      confirmVariant="danger"
      cancelText="Stay and save"
    />
  );
}
