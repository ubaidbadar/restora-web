import { Plus } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import useGet from '../../../hooks/useGet';
import type Branch from '../../../types/branch';
import Button from '../../../ui/button';
import useAuthStore from '../../../store/auth_store';
import toast from '../../../utils/toast';
import BranchFields from './branch_fields';
import BranchRow from './branch_row';
import branchSchema from './branch_schema';
import SkeletonList from '../../../components/skeleton_list';

/**
 * The restaurant's branches (`branches:manage`). Each has its own orders, daily tokens, reservations and POS terminals;
 * customers, khata, menu and tax are shared. Branches are archived, never deleted, so history keeps their name.
 */
export default function BranchesCard() {
  // Archived ones too, so they can be reopened.
  const { data: branches = [], loading, update } = useGet<Branch[]>('/branches?all=true');
  const open = branches.filter((branch) => branch.isActive !== false).length;

  return (
    <SectionCard
      title="Branches"
      description="Each branch has its own orders, tokens, reservations and POS terminals. Customers, khata, menu and tax are shared."
      flush
      action={
        <FormDrawer
          title="Add branch"
          schema={branchSchema}
          submitLabel="Add branch"
          onSave={(values) =>
            api
              .post('/branches', values)
              .then((res) => {
                update((current) => [...(current ?? []), res.data]);
                useAuthStore.getState().setBranch(res.data);
                toast.success(`${values.name} added. Give people access to it under Staff.`);
              })
          }
          fields={(form) => <BranchFields {...form} />}
          component={({ open: openDrawer }) => <Button variant="outline" icon={Plus} onClick={openDrawer}>Add branch</Button>}
        />
      }
    >
      {loading && <SkeletonList rows={2} variant="lines" />}
      <ul className="divide-y divide-border">
        {branches.map((branch) => (
          <BranchRow key={branch._id} branch={branch} isLastOpen={open <= 1} onSaved={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))} />
        ))}
      </ul>
    </SectionCard>
  );
}
