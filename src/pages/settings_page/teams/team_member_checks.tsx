import type FormComponentProps from '../../../types/form_component_props';
import type StaffMember from '../../../types/staff_member';
import Checkbox from '../../../ui/checkbox';
import FieldError from '../../../ui/field_error';
import fieldError from '../../../utils/field_error';

interface TeamMemberChecksProps extends Pick<FormComponentProps, 'register' | 'errors'> {
  members: StaffMember[];
}

/** Who is in the team. People must work at the team's branch. */
export default function TeamMemberChecks({ register, errors, members }: TeamMemberChecksProps) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-sm font-medium text-ink">People</legend>
      {members.map((member) => (
        <Checkbox key={member._id} label={member.user?.name ?? 'Someone'} value={member._id} {...register('membershipIds')} />
      ))}
      <FieldError>{fieldError(errors, 'membershipIds')}</FieldError>
    </fieldset>
  );
}
