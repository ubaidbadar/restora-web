import { useWatch } from 'react-hook-form';
import Tabs from '../../../ui/tabs';
import type FormComponentProps from '../../../types/form_component_props';
import BranchChecks from './branch_checks';

const SCOPES = [
  { value: 'all', label: 'All branches' },
  { value: 'list', label: 'Some branches' },
];

/** All branches (including new ones), or only the ticked ones. */
export default function BranchAccess({ register, errors, control }: Pick<FormComponentProps, 'register' | 'errors' | 'control'>) {
  const scope = useWatch({ control, name: 'branchScope' });
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-ink">Works at</legend>
      <Tabs register={register} name="branchScope" label="Works at" options={SCOPES} value={scope ?? 'all'} wrap />
      {scope === 'list' && <BranchChecks register={register} errors={errors} />}
    </fieldset>
  );
}
