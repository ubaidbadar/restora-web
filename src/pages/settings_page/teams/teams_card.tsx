import { Plus, UsersRound } from 'lucide-react';
import EmptyState from '../../../components/empty_state';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import useGet from '../../../hooks/useGet';
import type StaffMember from '../../../types/staff_member';
import type Team from '../../../types/team';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import TeamFields from './team_fields';
import TeamRow from './team_row';
import teamSchema from './team_schema';
import SkeletonList from '../../../components/skeleton_list';

/** Teams: groups of staff for shifts, sections and notifications. They never change what anyone may do; roles do. */
export default function TeamsCard({ members }: { members: StaffMember[] }) {
  const { data: teams = [], loading, update } = useGet<Team[]>('/teams');

  return (
    <SectionCard
      title="Teams"
      description="Group people by shift, section or branch, e.g. Evening shift or Kitchen. Teams don't give permissions: roles do."
      flush
      action={
        <FormDrawer
          title="New team"
          schema={teamSchema}
          defaultValues={{ branchId: '', membershipIds: [] }}
          submitLabel="Create team"
          onSave={(values) =>
            api
              .post('/teams', values)
              .then((res) => {
                update((current) => [...(current ?? []), res.data]);
                toast.success(`${values.name} created`);
              })
          }
          fields={(form) => <TeamFields {...form} members={members} />}
          component={({ open }) => <Button variant="outline" icon={Plus} onClick={open}>New team</Button>}
        />
      }
    >
      {loading && <SkeletonList rows={3} variant="lines" />}
      {!loading && !teams.length && (
        <div className="p-5">
          <EmptyState icon={UsersRound} title="No teams yet" text="Teams help when you plan shifts or send a message to one group." />
        </div>
      )}
      <ul className="divide-y divide-border">
        {teams.map((team) => (
          <TeamRow
            key={team._id}
            team={team}
            members={members}
            onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))}
            onDeleted={(id) => update((current) => current?.filter((item) => item._id !== id))}
          />
        ))}
      </ul>
    </SectionCard>
  );
}
