/** Someone who can unlock this POS terminal (`GET /pos/people`). */
export default interface PosPerson {
  membershipId: string;
  name: string;
  image?: string | null;
  roleNames: string[];
  /** Too many wrong PINs: a manager can unlock it. */
  locked: boolean;
  /** False until they set a PIN under Settings, My account. */
  hasPin: boolean;
}
