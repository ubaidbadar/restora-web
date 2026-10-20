import type { LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  /** What to do next, in one short sentence. */
  text: string;
  /** Use 'h1' when the empty state is the whole page (e.g. Not found). */
  titleAs?: 'p' | 'h1' | 'h2';
  children?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, text, titleAs: Title = 'p', children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-card border border-dashed border-border-strong bg-surface/60 px-6 py-10 text-center">
      <span className="mb-1.5 grid size-11 place-items-center rounded-full bg-sunken text-muted">
        <Icon size={22} aria-hidden="true" />
      </span>
      <Title className="text-heading text-ink">{title}</Title>
      <p className="max-w-sm text-sm text-muted">{text}</p>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}
