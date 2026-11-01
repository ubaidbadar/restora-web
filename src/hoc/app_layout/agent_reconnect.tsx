/**
 * Pairing is intentionally initiated by a person in Settings → Printers.
 * Do not silently create an agent for whichever restaurant/branch happens to be selected:
 * another authorized user may use this browser, or the PC may have moved branches.
 *
 * Local agent detection and the explicit Connect this PC action live in
 * pages/settings_page/printers/this_pc.tsx.
 */
export default function AgentReconnect() {
  return null;
}
