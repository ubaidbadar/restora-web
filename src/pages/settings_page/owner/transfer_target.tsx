import useGet from '../../../hooks/useGet';
import type FormComponentProps from '../../../types/form_component_props';
import type StaffMember from '../../../types/staff_member';
import Select from '../../../ui/select';
import fieldError from '../../../utils/field_error';

/** Who gets the restaurant: an active member of the team. */
export default function TransferTarget({ register, errors }: Pick<FormComponentProps, 'register' | 'errors'>) {
  const { data: members = [] } = useGet<StaffMember[]>('/members');
  const people = members.filter((member) => member.status === 'active' && !member.isPrimaryOwner);
  return (
    <Select
      label="New owner"
      required
      placeholder={people.length ? 'Pick someone' : 'Invite someone first'}
      defaultValue=""
      options={people.map((member) => ({ value: member._id, label: member.user?.name ?? 'Someone' }))}
      {...register('membershipId')}
      error={fieldError(errors, 'membershipId')}
    />
  );
}
