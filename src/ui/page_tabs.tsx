import { Link, useSearchParams } from 'react-router';
import withParam from '../utils/with_param';

interface PageTabsProps {
  label: string;
  /** The URL search param that holds the open part, e.g. `tab`. */
  param: string;
  options: { value: string; label: string }[];
  /** The open part (the first one when the URL names none). */
  value: string;
  className?: string;
}

/**
 * The parts of one page (Menu: Dishes, Deals…; a customer: Orders, Khata, Notes): words on a hairline, the open one
 * underlined in ink. Each is a link kept in the URL, so a refresh, a shared link and Back keep it. Scrolls sideways on a phone.
 */
export default function PageTabs({ label, param, options, value, className = '' }: PageTabsProps) {
  const [params] = useSearchParams();
  const first = options[0]?.value;

  return (
    <nav aria-label={label} className={`hide-scrollbar flex gap-6 overflow-x-auto border-b border-border ${className}`}>
      {options.map((option) => (
        <Link
          key={option.value}
          to={{ search: withParam(params, param, option.value, first).toString() }}
          replace
          aria-current={option.value === value ? 'page' : undefined}
          ref={option.value === value ? (element) => element?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) : undefined}
          className="-mb-px shrink-0 border-b-2 border-transparent pt-2 pb-2.5 text-sm font-medium whitespace-nowrap text-muted transition-colors -outline-offset-2 hover:text-ink aria-[current=page]:border-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink"
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
