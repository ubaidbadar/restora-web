import { useId, useState, type KeyboardEvent } from 'react';
import type Tab from '../types/tab';

const ARROW_STEPS: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 };

interface TabsProps {
  tabs: Tab[];
  activeTabId?: string;
  defaultTabId?: string;
  onChange?: (id: string) => void;
  className?: string;
}

export default function Tabs({ tabs, activeTabId, defaultTabId, onChange, className = '' }: TabsProps) {
  const idPrefix = useId();
  // Owned by the parent when `activeTabId` is given, here otherwise.
  const [internalId, setInternalId] = useState(defaultTabId || tabs[0]?.id || '');
  const selectedId = activeTabId ?? internalId;
  const setSelectedId = (id: string) => {
    if (activeTabId === undefined) setInternalId(id);
    onChange?.(id);
  };
  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === selectedId));
  const activeTab = tabs[activeIndex];

  if (!activeTab) return null;

  const tabId = (id: string) => `${idPrefix}-tab-${id}`;
  const panelId = (id: string) => `${idPrefix}-tabpanel-${id}`;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = ARROW_STEPS[e.key];
    const nextTab = step ? tabs[(activeIndex + step + tabs.length) % tabs.length] : undefined;
    if (!nextTab) return;

    e.preventDefault();
    setSelectedId(nextTab.id);
    document.getElementById(tabId(nextTab.id))?.focus();
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className="flex gap-4 border-b border-border overflow-x-auto hide-scrollbar max-sm:[mask-image:linear-gradient(to_right,black_85%,transparent)] max-sm:pe-12 max-sm:scroll-pe-12"
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={handleKeyDown}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              type="button"
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(tab.id)}
              id={tabId(tab.id)}
              tabIndex={isActive ? 0 : -1}
              // On a narrow screen the open tab may sit past the edge (e.g. ?tab=account): bring it into view.
              ref={isActive ? (element) => element?.scrollIntoView({ block: 'nearest', inline: 'nearest' }) : undefined}
              onClick={() => setSelectedId(tab.id)}
              className={`-mb-px min-h-11 px-1 text-sm whitespace-nowrap transition-colors border-b-2 -outline-offset-2 rounded-t-small ${
                isActive
                  ? 'border-primary font-semibold text-ink cursor-default'
                  : 'border-transparent font-medium text-muted hover:text-ink hover:border-border-strong cursor-pointer'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div
        className="py-4 rounded-small"
        role="tabpanel"
        tabIndex={0}
        id={panelId(activeTab.id)}
        aria-labelledby={tabId(activeTab.id)}
      >
        {activeTab.content}
      </div>
    </div>
  );
}
