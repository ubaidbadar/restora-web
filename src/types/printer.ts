/** A printer installed on the PC that runs a print agent. Staff name it and say what it prints. */
export default interface Printer {
  /** The name Windows gives it; what the agent prints to. */
  systemName: string;
  /** What staff call it: Kitchen, Bar, Receipt… */
  label: string;
  prints: ('kitchen' | 'receipt')[];
  /** Kitchen slips only: just the dishes of these menu categories. Empty: every dish. */
  categoryIds: string[];
  /** Characters per line: 48 on an 80 mm roll, 32 on 58 mm. */
  width: 48 | 32;
  copies: number;
  /** False when Windows no longer lists it (unplugged, removed). */
  present: boolean;
}
