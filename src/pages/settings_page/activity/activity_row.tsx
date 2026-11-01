import type AuditEntry from '../../../types/audit_entry';
import formatAgo from '../../../utils/format_ago';
import ACTION_LABELS from './action_labels';

interface ActivityRowProps {
  entry: AuditEntry;
}

/** "Hira Malik changed the access of Sana Iqbal · 5 minutes ago". */
export default function ActivityRow({ entry }: ActivityRowProps) {
  const what = ACTION_LABELS[entry.action] ?? entry.action;
  const self = ['membership.joined', 'membership.left', 'pin.set', 'pin.removed'].includes(entry.action);
  return (
    <li className="px-5 py-3 text-sm sm:px-6">
      <p className="text-body">
        <bdi className="font-medium text-ink">{entry.actor.name ?? 'Someone'}</bdi>
        {entry.actor.was && (
          <span className="text-muted">
            {' '}(was <bdi>{entry.actor.was}</bdi>)
          </span>
        )}{' '}
        {what}
        {!self && entry.target.label && (
          <>
            {' '}
            <bdi className="font-medium text-ink">{entry.target.label}</bdi>
          </>
        )}
      </p>
      <p className="text-xs text-muted">
        {formatAgo(entry.at)}
        {entry.actor.email && <span className="break-all"> · {entry.actor.email}</span>}
        {entry.actor.via === 'pos' && ' · on a POS terminal'}
      </p>
    </li>
  );
}
