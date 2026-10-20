/** The customer details an import can fill, and words in a column title that usually mean them. */
const IMPORT_FIELDS = [
  { key: 'name', label: 'Name', required: true, hints: ['name', 'customer', 'naam'] },
  { key: 'phone', label: 'Mobile number', required: true, hints: ['phone', 'mobile', 'cell', 'number', 'contact', 'whatsapp', 'tel'] },
  { key: 'area', label: 'Area', required: false, hints: ['area', 'address', 'location', 'city', 'block', 'sector'] },
  { key: 'openingKhata', label: 'Khata they owe now (Rs)', required: false, hints: ['khata', 'balance', 'due', 'udhaar', 'udhar', 'credit', 'owe'] },
] as const;

export default IMPORT_FIELDS;
