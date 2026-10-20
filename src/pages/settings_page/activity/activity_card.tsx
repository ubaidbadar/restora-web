import { History } from 'lucide-react';
import EmptyState from '../../../components/empty_state';
import SectionCard from '../../../components/section_card';
import SkeletonList from '../../../components/skeleton_list';
import useGet from '../../../hooks/useGet';
import type AuditEntry from '../../../types/audit_entry';
import ActivityRow from './activity_row';

/** Who changed what: staff, roles, branches, terminals, invitations and ownership, newest first (`audit:view`). */
export default function ActivityCard() {
  const { data: items = [], loading } = useGet<AuditEntry[]>('/audit');

  return (
    <SectionCard title="Activity" description="Every change to staff, roles, branches, terminals and ownership, and who made it." flush>
      {loading && <SkeletonList rows={6} variant="lines" />}
      {!loading && !items.length && (
        <div className="p-5">
          <EmptyState icon={History} title="Nothing yet" text="Changes show up here as people make them." />
        </div>
      )}
      <ul className="divide-y divide-border">
        {items.map((entry) => (
          <ActivityRow key={entry._id} entry={entry} />
        ))}
      </ul>
    </SectionCard>
  );
}
