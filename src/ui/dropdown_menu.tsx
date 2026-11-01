import { Check, MoreVertical } from 'lucide-react';
import {
    Fragment,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type ElementType,
    type KeyboardEvent,
    type ReactNode,
    type Ref,
} from 'react';
import { createPortal } from 'react-dom';
import useAnchoredPosition from '../hooks/useAnchoredPosition';
import useDismiss from '../hooks/useDismiss';
import type Placement from '../types/placement';
import IconButton from './icon_button';

const GAP = 8;
const OPEN_KEYS = ['Enter', ' ', 'ArrowDown'];

interface DropdownMenuItem extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  label: string;
  onClick: () => void;
  icon?: ElementType;
  danger?: boolean;
  /** A small heading shown above this item when it starts a new group. */
  section?: string;
  /** The current choice in a list of options: shows a check. */
  selected?: boolean;
}

interface DropdownMenuProps {
  /** The button that opens the menu. A function receives whether the menu is open, for its aria-expanded. */
  trigger?: ReactNode | ((isOpen: boolean) => ReactNode);
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
  /** The menu's width; w-52 by default. */
  menuClassName?: string;
}

export default function DropdownMenu({ trigger, items, align = 'right', className = '', menuClassName = 'w-52' }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const placeMenu: Placement = (anchor, menu) => {
    const spaceBelow = window.innerHeight - anchor.bottom;
    const opensUp = spaceBelow < menu.height && anchor.top > spaceBelow;
    const rightAligned = anchor.right - menu.width;
    // Flip to the other edge when the preferred alignment would overflow the viewport.
    const left =
      align === 'right'
        ? rightAligned < 0 ? anchor.left : rightAligned
        : anchor.left + menu.width > window.innerWidth ? rightAligned : anchor.left;

    return { top: opensUp ? anchor.top - menu.height - GAP : anchor.bottom + GAP, left };
  };

  const { anchorRef, floatingRef, floatingStyle } = useAnchoredPosition<HTMLDivElement>(isOpen, placeMenu);

  const open = (index = -1) => {
    setIsOpen(true);
    setActiveIndex(index);
  };

  const close = () => {
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const focusTrigger = () => anchorRef.current?.querySelector('button')?.focus();

  const focusItem = (index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  };

  const select = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    close();
  };

  useDismiss(isOpen, [anchorRef, floatingRef], (reason) => {
    close();
    if (reason === 'escape') focusTrigger();
  });

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isOpen) {
      if (OPEN_KEYS.includes(e.key)) {
        e.preventDefault();
        open(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem((activeIndex + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem((activeIndex - 1 + items.length) % items.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (items[activeIndex]) {
          select(items[activeIndex]);
          focusTrigger();
        }
        break;
      case 'Tab':
        close();
        break;
    }
  };

  return (
    <div className={`inline-block text-start ${className}`} ref={anchorRef} onKeyDown={handleKeyDown}>
      <div onClick={() => (isOpen ? close() : open())} className="contents cursor-pointer">
        {(typeof trigger === 'function' ? trigger(isOpen) : trigger) || (
          <IconButton icon={MoreVertical} aria-label="More options" aria-haspopup="menu" aria-expanded={isOpen} />
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={floatingRef}
            style={floatingStyle}
            role="menu"
            aria-orientation="vertical"
            className={`z-50 ${menuClassName} p-1 rounded-control bg-surface shadow-lg animate-pop-in motion-reduce:animate-none`}
          >
            {items.map((item, index) => (
              <Fragment key={`${item.label}-${index}`}>
                {item.section && item.section !== items[index - 1]?.section && (
                  <p role="presentation" className={`px-3 pb-1 text-xs font-medium text-muted ${index ? 'mt-1 border-t border-border pt-2' : 'pt-1.5'}`}>
                    {item.section}
                  </p>
                )}
                <MenuItem
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  item={item}
                  isActive={index === activeIndex}
                  onSelect={() => select(item)}
                  onHover={() => focusItem(index)}
                />
              </Fragment>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

interface MenuItemProps {
  ref: Ref<HTMLButtonElement>;
  item: DropdownMenuItem;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
}

function MenuItem({ ref, item, isActive, onSelect, onHover }: MenuItemProps) {
  const { label, icon: Icon, danger, section, selected, className = '', onClick, ...buttonProps } = item;
  // The active item is always the focused one (hover moves focus too), so focus alone drives the highlight.
  const toneClasses = danger ? 'text-danger-700 focus:bg-danger-50' : 'text-body focus:bg-sunken focus:text-ink';

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      onMouseEnter={onHover}
      // Opening from the keyboard activates the first item; focus it as it mounts.
      autoFocus={isActive}
      className={`flex min-h-9 w-full items-center gap-2 rounded-small px-3 py-2 text-sm text-start transition-colors outline-hidden cursor-pointer ${toneClasses} ${className}`}
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      {...buttonProps}
    >
      {Icon && <Icon size={16} aria-hidden="true" />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {selected && <Check size={16} className="shrink-0 text-primary" aria-label="Current" />}
    </button>
  );
}
