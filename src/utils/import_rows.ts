import parseAmount from './parse_amount';

type Mapping = Partial<Record<'name' | 'phone' | 'area' | 'openingKhata', string>>;

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

/** The file's rows as the details the server takes, using the picked column for each. Empty details are left out. */
export default function importRows(rows: unknown[][], mapping: Mapping) {
  const cell = (row: unknown[], key: keyof Mapping) => (mapping[key] ? row[Number(mapping[key])] : undefined);
  return rows.map((row) => {
    const khata = text(cell(row, 'openingKhata'));
    return {
      name: text(cell(row, 'name')) || undefined,
      phone: text(cell(row, 'phone')) || undefined,
      area: text(cell(row, 'area')) || undefined,
      openingKhata: khata ? parseAmount(khata) : undefined,
    };
  });
}
