/** One dish whose count changed in an order edit: 0 → 2 was added, 2 → 0 was removed. */
export default interface LineChange {
  name: string;
  /** Size, add-ons and note. */
  detail?: string;
  was: number;
  now: number;
}
