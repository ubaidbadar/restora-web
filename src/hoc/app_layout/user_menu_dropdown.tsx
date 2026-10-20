import { Lock, LogOut, Store, UserCog, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router';
import DropdownMenu from '../../ui/dropdown_menu';
import lockTerminal from '../../utils/lock_terminal';
import signOut from '../../utils/sign_out';

interface UserMenuDropdownProps {
  compact: boolean;
  /** On a shared POS terminal the only action is locking it. */
  terminal: boolean;
  trigger: (isOpen: boolean) => ReactNode;
}

/** The items of the user menu: account, other accounts on this browser, restaurants, sign out of all. */
export default function UserMenuDropdown({ compact, terminal, trigger }: UserMenuDropdownProps) {
  const navigate = useNavigate();

  const items = terminal
    ? [{ label: 'Lock the terminal', icon: Lock, onClick: () => void lockTerminal() }]
    : [
        { label: 'Account settings', icon: UserCog, onClick: () => navigate('/settings?tab=account') },
        { label: 'Switch account', icon: Users, onClick: () => navigate('/accounts') },
        { label: 'Restaurants', icon: Store, onClick: () => navigate('/restaurants') },
        { label: 'Sign out of all accounts', icon: LogOut, danger: true, onClick: () => void signOut() },
      ];

  return <DropdownMenu align={compact ? 'right' : 'left'} className={compact ? '' : 'w-full'} items={items} trigger={trigger} />;
}
