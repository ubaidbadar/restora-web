import { Search, X, type LucideIcon } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import useDismiss from '../hooks/useDismiss';
import IconButton from './icon_button';
import Input from './input';
import Skeleton from './skeleton';

interface SearchMenuAction {
  /** The row's content, e.g. "Save 0300-1234567 as a new customer". */
  label: ReactNode;
  icon?: LucideIcon;
  onSelect: () => void;
}

interface SearchMenuProps<T> {
  /** The search text: owned by the parent, which works out the results from it. */
  value: string;
  onChange: (value: string) => void;
  /** The results; undefined keeps the menu closed (e.g. too little typed yet). */
  items: T[] | undefined;
  getKey: (item: T) => string;
  /** One result's content; the row, its highlight and its tap area are drawn here. */
  renderItem: (item: T) => ReactNode;
  onPick: (item: T) => void;
  /** An extra last row reached with the arrows too, e.g. "Save as new". */
  action?: SearchMenuAction;
  loading?: boolean;
  /** Shown when there are no results and no action. */
  empty?: ReactNode;
  /** Names the box and the list for screen readers. */
  label: string;
  placeholder?: string;
  icon?: LucideIcon;
  inputMode?: 'search' | 'tel' | 'text' | 'numeric';
  autoFocus?: boolean;
  /** Keeps results in normal document flow instead of floating over the content. */
  inline?: boolean;
}

/**
 * A search box with its results in a menu under it (an ARIA combobox): ↑ ↓ move, Enter picks, Escape or a tap outside
 * closes. Focus stays in the box, so typing carries on while browsing. The parent filters; this draws and navigates.
 */
export default function SearchMenu<T>({
  value,
  onChange,
  items,
  getKey,
  renderItem,
  onPick,
  action,
  loading = false,
  empty = 'No results',
  label,
  placeholder,
  icon = Search,
  inputMode = 'search',
  autoFocus = false,
  inline = false,
}: SearchMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = items ?? [];
  const rowCount = results.length + (action ? 1 : 0);
  const showMenu = isOpen && items !== undefined;
  const active = Math.min(activeIndex, rowCount - 1);

  useDismiss(showMenu, [boxRef], () => setIsOpen(false));

  const choose = (index: number) => {
    const item = results[index];
    if (item !== undefined) onPick(item);
    else action?.onSelect();
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // ↓ opens the menu again after Escape closed it.
    if (!isOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      return setIsOpen(true);
    }
    if (!showMenu || !rowCount || loading) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((index) => (index + step + rowCount) % rowCount);
    } else if (event.key === 'Enter') {
      // Enter picks here instead of submitting a surrounding form.
      event.preventDefault();
      choose(active);
    }
  };

  // The box keeps focus: mousedown is stopped so a tap picks without blurring it first.
  const rowProps = (index: number) => ({
    id: `${listId}-${index}`,
    role: 'option',
    'aria-selected': index === active,
    onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault(),
    onMouseEnter: () => setActiveIndex(index),
    onClick: () => choose(index),
    className: `flex min-h-12 w-full cursor-pointer items-center gap-3 px-3 py-2 text-start transition-colors ${index === active ? 'bg-sunken' : ''}`,
  });

  return (
    <div ref={boxRef} className={inline ? 'min-w-0' : 'relative'}>
      <Input
        icon={icon}
        type="search"
        inputMode={inputMode}
        autoComplete="off"
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={label}
        role="combobox"
        aria-expanded={showMenu}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showMenu && rowCount && !loading ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        rightElement={value ? <IconButton icon={X} size="sm" aria-label="Clear search" onClick={() => onChange('')} /> : undefined}
      />
      {showMenu && (
        <div className={`${inline ? 'mt-2 overflow-hidden rounded-card border border-border bg-surface' : 'absolute inset-x-0 top-full z-30 mt-1.5 overflow-hidden rounded-card bg-surface shadow-lg'} animate-pop-in motion-reduce:animate-none`}>
          {loading ? (
            <div role="status" aria-label="Searching" className="flex flex-col gap-3 p-3">
              {[1, 2].map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          ) : (
            <ul id={listId} role="listbox" aria-label={label} className="max-h-80 overflow-y-auto py-1">
              {results.map((item, index) => (
                <li key={getKey(item)} {...rowProps(index)}>
                  {renderItem(item)}
                </li>
              ))}
              {!rowCount && <li className="px-3 py-4 text-center text-sm text-muted">{empty}</li>}
              {action && (
                <li {...rowProps(results.length)} className={`${rowProps(results.length).className} font-medium text-primary ${results.length ? 'border-t border-border' : ''}`}>
                  {action.icon && (
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft">
                      <action.icon size={16} aria-hidden="true" />
                    </span>
                  )}
                  <span className="text-sm">{action.label}</span>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
