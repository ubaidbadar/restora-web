/** The list with `doc` in place of the record with its `_id`, or added at the end. */
export default function upsertById<T extends { _id: string }>(list: T[], doc: T): T[] {
  return list.some((entry) => entry._id === doc._id) ? list.map((entry) => (entry._id === doc._id ? doc : entry)) : [...list, doc];
}
