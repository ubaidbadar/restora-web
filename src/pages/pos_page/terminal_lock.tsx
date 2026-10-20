import useGet from '../../hooks/useGet';
import type PosState from '../../types/pos_state';
import LockScreen from './lock_screen';

/** The locked terminal's details from the server. */
export default function TerminalLock() {
  const { data: pos } = useGet<PosState>('/pos/state');
  return pos ? <LockScreen pos={pos} /> : null;
}
