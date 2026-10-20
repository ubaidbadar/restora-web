import useGet from '../../../hooks/useGet';
import type StaffMember from '../../../types/staff_member';
import TeamsCard from './teams_card';

/** The Teams tab. The staff list (who can be in a team) is loaded once here, for every team form. */
export default function TeamsTab() {
  const { data: members = [] } = useGet<StaffMember[]>('/members');
  return <TeamsCard members={members} />;
}
