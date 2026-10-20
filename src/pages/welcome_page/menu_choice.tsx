
interface MenuChoiceProps {
  title: string;
  description: string;
  /** Small labels, e.g. the sample menu's categories. */
  tags?: string[];
  recommended?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

/** One way to start the menu, as a large tappable card: choosing it finishes the setup. */
export default function MenuChoice({ title, description, tags, recommended = false, loading = false, disabled = false, onClick }: MenuChoiceProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={loading}
      className={`flex flex-col items-start gap-2 rounded-card border p-4 text-start transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed ${
        recommended ? 'border-primary bg-primary-soft/60 hover:bg-primary-soft' : 'border-border bg-surface hover:bg-sunken'
      } ${disabled && !loading ? 'opacity-60' : ''}`}
    >
      <span className="flex w-full items-center justify-between gap-2">
        <span className="font-semibold text-ink">{title}</span>
        {loading ? (
          <span className="text-xs font-semibold text-primary motion-safe:animate-pulse">Setting up…</span>
        ) : (
          recommended && <span className="rounded-pill bg-primary px-2 py-0.5 text-xs font-semibold text-on-primary">Recommended</span>
        )}
      </span>
      <span className="text-sm text-body">{description}</span>
      {tags && (
        <span className="mt-1 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className="rounded-small bg-surface px-2 py-0.5 text-xs text-muted shadow-card">
              {tag}
            </span>
          ))}
        </span>
      )}
    </button>
  );
}
