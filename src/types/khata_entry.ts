/** One line of a customer's khata: + adds to what they owe, − is a payment. */
export default interface KhataEntry {
  _id: string;
  type: 'order' | 'adjustment' | 'payment' | 'reversal' | 'opening' | 'merge';
  amount: number;
  orderToken?: number;
  reversedAt?: string;
  note?: string;
  by?: { name: string };
  balanceAfter: number;
  createdAt: string;
}
