import { Pencil, Trash2 } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import type StaffMember from '../../../types/staff_member';
import type Team from '../../../types/team';
import AlertModal from '../../../ui/alert_modal/modal';
import IconButton from '../../../ui/icon_button';
import toast from '../../../utils/toast';
import TeamFields from './team_fields';
import teamSchema from './team_schema';
import getAxiosMessage from '../../../utils/get_axios_message';

interface TeamRowProps {
  team: Team;
  members: StaffMember[];
  onSaved: (team: Team) => void;
  onDeleted: (id: string) => void;
}

export default function TeamRow({ team, members, onSaved, onDeleted }: TeamRowProps) {
  const people = team.membershipIds.length === 1 ? '1 person' : `${team.membershipIds.length} people`;
  return (
    <li className="flex min-h-14 items-center justify-between gap-2 py-2 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <span className="min-w-0">
        <span dir="auto" className="block truncate font-medium text-ink">{team.name}</span>
        <span className="block truncate text-sm text-muted">{people}{team.description ? ` · ${team.description}` : ''}</span>
      </span>
      <span className="flex shrink-0">
        <FormDrawer
          title={`Edit ${team.name}`}
          schema={teamSchema}
          defaultValues={{ name: team.name, description: team.description ?? '', branchId: team.branchId ?? '', membershipIds: team.membershipIds }}
          onSave={(values) =>
            api
              .patch(`/teams/${team._id}`, values)
              .then((res) => {
                onSaved(res.data);
                toast.success('Team saved');
              })
          }
          fields={(form) => <TeamFields {...form} members={members} />}
          component={({ open }) => <IconButton icon={Pencil} aria-label={`Edit ${team.name}`} onClick={open} />}
        />
        <AlertModal
          title={`Delete ${team.name}?`}
          description="Only the group goes. Nobody loses access."
          confirmText="Delete"
          onConfirm={() =>
            api
              .delete(`/teams/${team._id}`)
              .then(() => {
                onDeleted(team._id);
                toast.success(`${team.name} deleted`);
              }).catch((err) => toast.error(getAxiosMessage(err)))
          }
          component={({ open }) => <IconButton icon={Trash2} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${team.name}`} onClick={open} />}
        />
      </span>
    </li>
  );
}
