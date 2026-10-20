import LoadFailed from '../../components/load_failed';
import SkeletonGrid from '../../components/skeleton_grid';
import useGet from '../../hooks/useGet';
import type PosPerson from '../../types/pos_person';
import PeoplePicker from './people_picker';

/** Who works at this terminal's branch. People without a PIN set one in their account first. */
export default function PosPeople() {
  const { data: people, loading, get } = useGet<PosPerson[]>('/pos/people');
  if (!people) return loading ? <SkeletonGrid tiles={6} columns="grid-cols-2 sm:grid-cols-3" height="h-24" /> : <LoadFailed what="the people at this branch" onRetry={() => get()} />;
  if (!people.length) return <p className="text-sm text-muted">Nobody works at this branch yet. Invite people under Settings, Staff.</p>;
  return <PeoplePicker people={people} />;
}
