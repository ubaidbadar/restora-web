/** One line of the activity log (`GET /audit`). */
export default interface AuditEntry {
  _id: string;
  action: string;
  /**
   * Who did it, as they are now: found by account, so a renamed or look-alike name can't hide the person. `was` is the
   * name they went by then, when it differs. Old entries and the system have only the saved name.
   */
  actor: { name?: string; email?: string; was?: string; via: 'web' | 'pos' | 'system' };
  target: { type: string; id?: string; label?: string };
  changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
  at: string;
}
