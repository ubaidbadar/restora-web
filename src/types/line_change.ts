/** One dish whose count or unit price changed in an order edit. */
export default interface LineChange {
  name: string;
  /** Size, add-ons and note. */
  detail?: string;
  was: number;
  now: number;
  /** Per-unit price before and after a manual adjustment. */
  wasPrice?: number;
  nowPrice?: number;
}
