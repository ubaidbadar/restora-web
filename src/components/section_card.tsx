import { type ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  /** One sentence on what this section controls. */
  description?: string;
  /** A button at the end of the header, e.g. "Add branch". */
  action?: ReactNode;
  /** The action bar under the content (Save, Change password…). It stays in view while a long section scrolls. */
  footer?: ReactNode;
  /** Edge-to-edge content, for lists whose rows carry their own padding. */
  flush?: boolean;
  /** Lets the card grow to the page width instead of the usual max-w-3xl, for content that needs the room (e.g. a wide table). */
  wide?: boolean;
  children: ReactNode;
}

/** The one layout every Settings tab uses: header, content, footer bar. Rows inside a flush card use `px-5 sm:px-6`. */
export default function SectionCard({ title, description, action, footer, flush = false, wide = false, children }: SectionCardProps) {
  return (
    <section className={`rounded-card bg-surface shadow-card ${wide ? 'max-w-full' : 'max-w-3xl'}`}>
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0 flex-1 basis-60">
          <h2 className="text-heading text-ink">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </div>
        {action}
      </header>
      <div className={flush ? '' : 'px-5 py-5 sm:px-6'}>{children}</div>
      {footer && (
        <footer className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex flex-wrap items-center justify-end gap-3 rounded-b-card border-t border-border bg-surface px-5 py-3 sm:px-6 lg:bottom-0">
          {footer}
        </footer>
      )}
    </section>
  );
}
