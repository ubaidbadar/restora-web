import AuthCard from '../../components/auth_card';
import type PosState from '../../types/pos_state';
import formatTime from '../../utils/format_time';
import PosPeople from './pos_people';

interface LockScreenProps {
  pos: PosState;
}

/** The locked terminal: where it is, and the people who can unlock it. */
export default function LockScreen({ pos }: LockScreenProps) {
  return (
    <AuthCard title="Who is working?" subtitle={`${pos.restaurant.name} · ${pos.branch.name} · ${pos.device.name}`}>
      {pos.pausedUntil ? (
        <p role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">
          Too many wrong PINs on this terminal. It opens again at {formatTime(pos.pausedUntil)}.
        </p>
      ) : (
        <PosPeople />
      )}
    </AuthCard>
  );
}
