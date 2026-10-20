import { Link, Navigate } from 'react-router';
import AuthCard from '../../components/auth_card';
import useAuthStore from '../../store/auth_store';
import Button from '../../ui/button';
import TerminalLock from './terminal_lock';

/**
 * A shared POS terminal. Locked: staff tap their name and type their PIN. Someone unlocked: on to taking orders.
 * A browser that is not a terminal is told how to make it one.
 */
export default function PosPage() {
  const { me, terminal } = useAuthStore();

  if (me?.mode === 'pos') return <Navigate to="/orders/new" replace />;
  if (terminal) return <TerminalLock />;

  return (
    <AuthCard
      title="Not a POS terminal"
      subtitle={me ? `This browser is signed in as ${me.user.email}.` : 'This browser is not registered as a POS terminal.'}
    >
      <div className="flex flex-col gap-3 text-sm text-body">
        <p>To use it as a shared counter terminal, a manager signs in here and registers it under Settings, Devices.</p>
        <Button as={Link} to={me ? '/settings?tab=devices' : '/login?next=%2Fsettings%3Ftab%3Ddevices'} size="lg">
          {me ? 'Open Devices' : 'Sign in'}
        </Button>
      </div>
    </AuthCard>
  );
}
