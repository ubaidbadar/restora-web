import { ChevronsUpDown } from 'lucide-react';
import useAuthStore from '../../store/auth_store';
import Avatar from '../../ui/avatar';
import initialsOf from '../../utils/initials_of';
import UserMenuDropdown from './user_menu_dropdown';

interface UserMenuProps {
  /** Avatar only (phone top bar) instead of avatar, name and role (sidebar). */
  compact?: boolean;
}

/** Click the signed-in person to reach their account, other accounts and restaurants, or signing out (locking on a terminal). */
export default function UserMenu({ compact = false }: UserMenuProps) {
  const me = useAuthStore((state) => state.me);
  if (!me) return null;
  const name = me.user.name;

  return (
    <UserMenuDropdown
      compact={compact}
      terminal={me.mode === 'pos'}
      trigger={(isOpen) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-label={`Account menu for ${name}`}
          className={`flex cursor-pointer items-center gap-3 rounded-control text-start transition-colors -outline-offset-2 hover:bg-hover ${compact ? 'p-1' : 'w-full p-2'} ${isOpen ? 'bg-hover' : ''}`}
        >
          <Avatar initials={initialsOf(name)} alt="" size={compact ? 'sm' : 'md'} />
          {!compact && (
            <>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink"><bdi>{name}</bdi></span>
                <span className="block truncate text-xs text-muted">{me.workplace?.roleNames.join(', ')}</span>
              </span>
              <ChevronsUpDown size={16} className="shrink-0 text-muted" aria-hidden="true" />
            </>
          )}
        </button>
      )}
    />
  );
}
