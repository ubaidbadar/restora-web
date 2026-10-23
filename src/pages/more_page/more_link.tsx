import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import type NavLinkItem from '../../types/nav_link_item';

/** One page in the More list: its icon in a soft tile, its name, and a chevron, as a phone's settings list. */
export default function MoreLink({ to, label, icon: Icon }: NavLinkItem) {
  return (
    <Link to={to} className="flex min-h-14 items-center gap-3 px-4 text-base font-medium text-ink transition-colors -outline-offset-2 hover:bg-hover active:bg-sunken">
      <span className="grid size-9 shrink-0 place-items-center rounded-control bg-primary-soft text-primary">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <ChevronRight size={18} className="shrink-0 text-subtle rtl:rotate-180" aria-hidden="true" />
    </Link>
  );
}
