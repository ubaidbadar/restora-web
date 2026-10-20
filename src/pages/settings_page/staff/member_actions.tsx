import { Pencil, Trash2, UserCheck, UserX } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import type Role from '../../../types/role';
import type StaffMember from '../../../types/staff_member';
import AlertModal from '../../../ui/alert_modal/modal';
import ConfirmModal from '../../../ui/confirm_modal/modal';
import IconButton from '../../../ui/icon_button';
import toast from '../../../utils/toast';
import AccessFields from './access_fields';
import accessSchema from './access_schema';
import PinMenu from './pin_menu';
import getAxiosMessage from '../../../utils/get_axios_message';

interface MemberActionsProps {
  member: StaffMember;
  name: string;
  roles: Role[];
  /** Gets the saved member (the server answers with the row as the list shows it). */
  onSaved: (member: StaffMember) => void;
  onRemoved: (id: string) => void;
}

/** Change roles and branches, suspend or reactivate, remove, and PIN help. */
export default function MemberActions({ member, name, roles, onSaved, onRemoved }: MemberActionsProps) {
  const suspended = member.status === 'suspended';

  return (
    <span className="flex shrink-0">
      <FormDrawer
        title={`${name}'s access`}
        schema={accessSchema}
        defaultValues={{ roleIds: member.roleIds, branchScope: member.branchScope, branchIds: member.branchIds }}
        onSave={(values) =>
          api.patch(`/members/${member._id}`, values).then((res) => {
            onSaved(res.data);
            toast.success(`${name}'s access changed. It applies straight away.`);
          })
        }
        fields={(form) => <AccessFields {...form} roles={roles} />}
        component={({ open }) => <IconButton icon={Pencil} size="lg" aria-label={`Change ${name}'s access`} onClick={open} />}
      />
      {member.hasPin && <PinMenu member={member} name={name} onSaved={onSaved} />}
      {suspended ? (
        <ConfirmModal
          title={`Let ${name} work again?`}
          description="They get back the roles and branches they had."
          confirmText="Reactivate"
          onConfirm={() =>
            api
              .post(`/members/${member._id}/activate`)
              .then((res) => {
                onSaved(res.data);
                toast.success(`${name} can work again`);
              })
              .catch((err) => toast.error(getAxiosMessage(err)))
          }
          component={({ open }) => <IconButton icon={UserCheck} size="lg" aria-label={`Reactivate ${name}`} onClick={open} />}
        />
      ) : (
        <AlertModal
          title={`Suspend ${name}?`}
          description="They are signed out of this restaurant at once and cannot work until you reactivate them. Their roles, PIN and history are kept."
          confirmText="Suspend"
          onConfirm={() =>
            api
              .post(`/members/${member._id}/suspend`)
              .then((res) => {
                onSaved(res.data);
                toast.success(`${name} is suspended`);
              })
              .catch((err) => toast.error(getAxiosMessage(err)))
          }
          component={({ open }) => <IconButton icon={UserX} size="lg" aria-label={`Suspend ${name}`} onClick={open} />}
        />
      )}
      <AlertModal
        title={`Remove ${name}?`}
        description="They can no longer work here. Orders they took keep their name. To bring them back, invite them again."
        confirmText="Remove"
        onConfirm={() =>
          api
            .delete(`/members/${member._id}`)
            .then(() => {
              onRemoved(member._id);
              toast.success(`${name} removed`);
            })
            .catch((err) => toast.error(getAxiosMessage(err)))
        }
        component={({ open }) => <IconButton icon={Trash2} size="lg" className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Remove ${name}`} onClick={open} />}
      />
    </span>
  );
}
