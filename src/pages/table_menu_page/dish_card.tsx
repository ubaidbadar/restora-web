import type PublicMenu from '../../types/public_menu';
import Badge from '../../ui/badge';
import formatRs from '../../utils/format_rs';

interface DishCardProps {
  dish: PublicMenu['items'][number];
  groups: PublicMenu['addonGroups'];
}

/** A dish as guests read it: its name, what it is, every size with its price, and the extras it comes with. */
export default function DishCard({ dish, groups }: DishCardProps) {
  return (
    <li className={`flex gap-3 rounded-card bg-surface p-3 shadow-card ${dish.soldOut ? 'opacity-60' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2 font-semibold text-ink">
          {dish.name}
          {dish.soldOut && <Badge variant="neutral">Sold out</Badge>}
        </p>
        {dish.description && <p className="mt-1 text-sm text-body">{dish.description}</p>}
        <p className="mt-1.5 text-sm font-semibold tabular-nums text-ink">
          {dish.sizes.map((size) => (size.name ? `${size.name} ${formatRs(size.price)}` : formatRs(size.price))).join(' · ')}
        </p>
        {groups.map((group) => (
          <p key={group._id} className="mt-0.5 text-sm text-muted">
            {group.name}: {group.options.map((option) => (option.price ? `${option.name} +${formatRs(option.price)}` : option.name)).join(', ')}
          </p>
        ))}
      </div>
      {dish.photo && <img src={dish.photo} alt="" loading="lazy" className="size-24 shrink-0 rounded-small object-cover" />}
    </li>
  );
}
