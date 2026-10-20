export default interface AddonOption {
  _id: string;
  name: string;
  /** Rupees added to the dish; 0 for a free choice. */
  price: number;
}
