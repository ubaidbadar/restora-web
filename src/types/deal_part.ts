/** A dish in a deal: which one, its size (the dish's first when not set) and how many in one deal. */
export default interface DealPart {
  itemId: string;
  sizeId?: string;
  qty: number;
}
