/** A group of staff in the current restaurant (`GET /teams`). */
export default interface Team {
  _id: string;
  name: string;
  description?: string;
  branchId?: string;
  membershipIds: string[];
  archivedAt?: string;
}
