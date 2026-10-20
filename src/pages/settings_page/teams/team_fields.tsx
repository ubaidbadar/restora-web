import type FormComponentProps from '../../../types/form_component_props';
import type StaffMember from '../../../types/staff_member';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import TeamBranchSelect from './team_branch_select';
import TeamMemberChecks from './team_member_checks';

interface TeamFieldsProps extends FormComponentProps {
  members: StaffMember[];
}

/** A team's name, its branch (optional) and who is in it. */
export default function TeamFields({ members, ...form }: TeamFieldsProps) {
  const { register, errors } = form;
  return (
    <>
      <Input label="Team name" dir="auto" required autoFocus placeholder="e.g. Evening shift – Gulberg" {...register('name')} error={fieldError(errors, 'name')} />
      <Input label="What it is for (optional)" dir="auto" {...register('description')} />
      <TeamBranchSelect register={register} />
      <TeamMemberChecks register={register} errors={errors} members={members} />
    </>
  );
}
