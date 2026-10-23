import { Archive, ArchiveRestore, Pencil } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import type Branch from '../../../types/branch';
import AlertModal from '../../../ui/alert_modal/modal';
import Badge from '../../../ui/badge';
import ConfirmModal from '../../../ui/confirm_modal/modal';
import IconButton from '../../../ui/icon_button';
import useAuthStore from '../../../store/auth_store';
import toast from '../../../utils/toast';
import BranchFields from './branch_fields';
import branchSchema from './branch_schema';
import getAxiosMessage from '../../../utils/get_axios_message';

interface BranchRowProps {
  branch: Branch;
  /** The last open branch cannot be archived. */
  isLastOpen: boolean;
  onSaved: (branch: Branch) => void;
}

export default function BranchRow({ branch, isLastOpen, onSaved }: BranchRowProps) {
  const archived = branch.isActive === false;

  const act = (action: 'archive' | 'reopen', done: string) => {
    api
      .post(`/branches/${branch._id}/${action}`)
      .then((res) => {
        onSaved(res.data);
        useAuthStore.getState().setBranch(res.data);
        toast.success(`${branch.name} ${done}.`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <li className="flex min-h-14 items-center justify-between gap-2 py-1.5 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <span dir="auto" className="min-w-0 truncate text-ink">
        <span className="font-medium">{branch.name}</span>
        {branch.area && <span className="text-muted"> · {branch.area}</span>}
        {archived && <Badge variant="neutral" className="ms-2">Archived</Badge>}
      </span>
      <span className="flex shrink-0">
        <FormDrawer
          title="Edit branch"
          schema={branchSchema}
          defaultValues={{ name: branch.name, address: branch.address ?? '', area: branch.area ?? '', city: branch.city ?? '', phone: branch.phone ?? '' }}
          onSave={(values) =>
            api
              .patch(`/branches/${branch._id}`, values)
              .then((res) => {
                onSaved(res.data);
                useAuthStore.getState().setBranch(res.data);
                toast.success('Branch saved');
              })
          }
          fields={(form) => <BranchFields {...form} />}
          component={({ open }) => <IconButton icon={Pencil} aria-label={`Edit ${branch.name}`} onClick={open} />}
        />
        {archived ? (
          <ConfirmModal
            title={`Reopen ${branch.name}?`}
            description="It opens again for people with access to all branches. People who lost access when it was archived need it given back under Staff."
            confirmText="Reopen"
            onConfirm={() => act('reopen', 'reopened')}
            component={({ open }) => <IconButton icon={ArchiveRestore} aria-label={`Reopen ${branch.name}`} onClick={open} />}
          />
        ) : (
          !isLastOpen && (
            <AlertModal
              title={`Archive ${branch.name}?`}
              description="Its orders and reports stay. Its POS terminals stop working, and people who only worked here lose access until you give them another branch."
              confirmText="Archive"
              onConfirm={() => act('archive', 'archived')}
              component={({ open }) => <IconButton icon={Archive} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Archive ${branch.name}`} onClick={open} />}
            />
          )
        )}
      </span>
    </li>
  );
}
