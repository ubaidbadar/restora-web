import { useEffect } from 'react';
import lockTerminal from '../../utils/lock_terminal';

interface PosIdleLockProps {
  seconds: number;
}

const ACTIVITY = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

/** Locks a POS terminal after `seconds` without anyone touching it. The server locks it too if no request comes. */
export default function PosIdleLock({ seconds }: PosIdleLockProps) {
  useEffect(() => {
    let timer = window.setTimeout(() => void lockTerminal(), seconds * 1000);
    const restart = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void lockTerminal(), seconds * 1000);
    };
    ACTIVITY.forEach((name) => window.addEventListener(name, restart, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      ACTIVITY.forEach((name) => window.removeEventListener(name, restart));
    };
  }, [seconds]);

  return null;
}
