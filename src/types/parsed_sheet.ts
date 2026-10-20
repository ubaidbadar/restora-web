/** A customer list read from a file or the phone's contacts: the first row's titles and the rows under them. */
export default interface ParsedSheet {
  fileName: string;
  headers: string[];
  rows: unknown[][];
}
