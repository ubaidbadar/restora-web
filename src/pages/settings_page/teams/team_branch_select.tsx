import type FormComponentProps from '../../../types/form_component_props';
import Select from '../../../ui/select';
import useWorkplace from '../../../hooks/useWorkplace';

/** Tie the team to one branch, or none (the whole restaurant). Branches from /me (no request). */
export default function TeamBranchSelect({ register }: Pick<FormComponentProps, 'register'>) {
  const branches = useWorkplace()?.branches ?? [];
  return <Select label="Branch" options={[{ value: '', label: 'Whole restaurant' }, ...branches.map((branch) => ({ value: branch._id, label: branch.name }))]} {...register('branchId')} />;
}
