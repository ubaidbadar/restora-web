/** One restaurant you work at, as listed on /restaurants. */
export default interface Membership {
  _id: string;
  status: 'active' | 'suspended';
  roleNames: string[];
  isPrimaryOwner: boolean;
  restaurant: { _id: string; name: string; status: 'active' | 'deleting'; deleteAfter?: string };
}
