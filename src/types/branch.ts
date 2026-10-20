export default interface Branch {
  _id: string;
  name: string;
  address?: string;
  /** Locality, e.g. "Gulberg" or "DHA Phase 5". */
  area?: string;
  city?: string;
  phone?: string;
  /** False once archived. */
  isActive?: boolean;
  archivedAt?: string;
}
