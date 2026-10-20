import { CircleCheck } from 'lucide-react';
import { Link } from 'react-router';
import SectionCard from '../../components/section_card';
import type ImportAnswer from '../../types/import_answer';
import Button from '../../ui/button';

/** What was imported, and every skipped row with why, so the file can be fixed and imported again. */
export default function ImportResult({ result, onAgain }: { result: ImportAnswer; onAgain: () => void }) {
  return (
    <SectionCard
      title="Import finished"
      footer={
        <>
          <Button variant="ghost" onClick={onAgain}>
            Import another file
          </Button>
          <Button as={Link} to="/customers">
            See customers
          </Button>
        </>
      }
    >
      <p className="flex items-center gap-2 text-base font-medium text-ink">
        <CircleCheck size={20} className="text-success-700" aria-hidden="true" />
        {result.added} added{result.filled ? `, ${result.filled} updated` : ''}
        {result.skipped.length ? `, ${result.skipped.length} skipped` : ''}
      </p>
      {result.skipped.length > 0 && (
        <ul className="mt-4 max-h-80 divide-y divide-border overflow-y-auto rounded-control border border-border text-sm">
          {result.skipped.map((entry) => (
            <li key={entry.row} className="flex gap-3 px-3 py-2">
              <span className="w-16 shrink-0 tabular-nums text-muted">Row {entry.row}</span>
              <span className="text-body">{entry.reason}</span>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
