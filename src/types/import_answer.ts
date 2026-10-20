/** `POST /customers/import`: what happened to the rows sent. Row numbers count from 1, the first row under the titles. */
export default interface ImportAnswer {
  added: number;
  filled: number;
  skipped: { row: number; reason: string }[];
}
