import { Pencil, RotateCcw, Trash2 } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import type Role from '../../../types/role';
import AlertModal from '../../../ui/alert_modal/modal';
import ConfirmModal from '../../../ui/confirm_modal/modal';
import IconButton from '../../../ui/icon_button';
import toast from '../../../utils/toast';
import RoleFields from './role_fields';
import roleSchema from './role_schema';
import getAxiosMessage from '../../../utils/get_axios_message';

interface RoleHeaderProps {
  role: Role;
  /** Gets the saved role (renamed or reset), as the server answers it. */
  onSaved: (role: Role) => void;
  onDeleted: (id: string) => void;
}

/** A role's column head: name, how many people have it, and rename / reset / delete as fits the role. */
export default function RoleHeader({ role, onSaved, onDeleted }: RoleHeaderProps) {
  const people = role.memberCount === 1 ? '1 person' : `${role.memberCount} people`;

  return (
    <div className="flex min-w-24 flex-col items-center gap-1">
      <span dir="auto" className="font-semibold text-ink">{role.name}</span>
      <span className="text-xs text-muted">{role.isPreset ? 'Preset · ' : ''}{people}</span>
      {role.key !== 'owner' && (
        <span className="flex">
          {role.isPreset ? (
            <ConfirmModal
              title={`Reset ${role.name}?`}
              description="Its permissions go back to Restora's defaults for this role."
              confirmText="Reset"
              onConfirm={() =>
                api.post(`/roles/${role._id}/reset`).then((res) => {
                  onSaved(res.data);
                  toast.success(`${role.name} reset`);
                }).catch((err) => toast.error(getAxiosMessage(err)))
              }
              component={({ open }) => <IconButton icon={RotateCcw} aria-label={`Reset ${role.name} to its defaults`} onClick={open} />}
            />
          ) : (
            <>
              <FormDrawer
                title={`Rename ${role.name}`}
                schema={roleSchema.pick({ name: true, description: true })}
                defaultValues={{ name: role.name, description: role.description ?? '' }}
                onSave={(values) =>
                  api.patch(`/roles/${role._id}`, values).then((res) => {
                    onSaved(res.data);
                    toast.success('Role saved');
                  })
                }
                fields={(form) => <RoleFields {...form} nameOnly />}
                component={({ open }) => <IconButton icon={Pencil} aria-label={`Rename ${role.name}`} onClick={open} />}
              />
              <AlertModal
                title={`Delete ${role.name}?`}
                description={role.memberCount ? `${people} still ${role.memberCount === 1 ? 'has' : 'have'} this role. Give them another role first.` : 'Nobody has this role.'}
                confirmText="Delete"
                onConfirm={() =>
                  api.delete(`/roles/${role._id}`).then(() => {
                    onDeleted(role._id);
                    toast.success(`${role.name} deleted`);
                  }).catch((err) => toast.error(getAxiosMessage(err)))
                }
                component={({ open }) => <IconButton icon={Trash2} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Delete ${role.name}`} onClick={open} />}
              />
            </>
          )}
        </span>
      )}
    </div>
  );
}
