/** A table of the active branch. `qrCode` is the random part of its QR link (/t/<code>). */
export default interface Table {
  _id: string;
  name: string;
  section?: string;
  seats?: number;
  qrCode: string;
  archived: boolean;
}
