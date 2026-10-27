import type Printer from './printer';

/** A print agent: the app on a branch's PC that prints for the web app (`GET /print-agents`). */
export default interface PrintAgent {
  _id: string;
  name: string;
  branchId: string;
  version?: string;
  /** Set once the agent has connected; the agent counts as online while this is recent. */
  lastSeenAt?: string;
  /** Present until the agent pairs: type this code into the agent. */
  pairing?: { code: string; expiresAt: string };
  printers: Printer[];
  createdAt: string;
}
