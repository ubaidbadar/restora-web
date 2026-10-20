/** One line of the activity log (`GET /audit`). */
export default interface AuditEntry {
  _id: string;
  action: string;
  actor: { name?: string; via: 'web' | 'pos' | 'system' };
  target: { type: string; id?: string; label?: string };
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  at: string;
}
