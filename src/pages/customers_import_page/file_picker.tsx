import { Contact, FileSpreadsheet } from 'lucide-react';
import type { ChangeEvent } from 'react';
import SectionCard from '../../components/section_card';
import type ParsedSheet from '../../types/parsed_sheet';
import Button from '../../ui/button';
import toast from '../../utils/toast';

interface ContactsManager {
  select: (properties: string[], options: { multiple: boolean }) => Promise<{ name?: string[]; tel?: string[] }[]>;
}

const manager = () => (navigator as Navigator & { contacts?: ContactsManager }).contacts;

/** Reads a CSV or Excel file in the browser (nothing is uploaded until Import). The parsers load only when needed. */
async function parseCustomerFile(file: File): Promise<ParsedSheet> {
  let table: unknown[][];
  if (/\.xlsx$/i.test(file.name)) {
    const { default: readXlsxFile } = await import('read-excel-file');
    table = await readXlsxFile(file);
  } else if (/\.(csv|txt)$/i.test(file.name)) {
    const { default: Papa } = await import('papaparse');
    table = Papa.parse<string[]>(await file.text(), { skipEmptyLines: 'greedy' }).data;
  } else {
    throw new Error('Pick a .csv or .xlsx file. In Excel or Google Sheets, use "Save as" or "Download" to get one.');
  }
  const [headers = [], ...rows] = table;
  if (!rows.length) throw new Error('This file has no rows under the column titles.');
  return { fileName: file.name, headers: headers.map((cell, index) => String(cell ?? '').trim() || `Column ${index + 1}`), rows };
}

/** The phone's own contact picker (Chrome on Android). The person picks who to share; we get only names and numbers. */
async function pickContacts(): Promise<ParsedSheet | null> {
  const contacts = await manager()!.select(['name', 'tel'], { multiple: true });
  if (!contacts.length) return null;
  return { fileName: 'Phone contacts', headers: ['Name', 'Mobile'], rows: contacts.map((contact) => [contact.name?.[0] ?? '', contact.tel?.[0] ?? '']) };
}

/** Only some phones let a web page ask for contacts. */
pickContacts.supported = () => Boolean(manager()?.select);

/** Where the list comes from. The file is read here in the browser; nothing is sent until the last step. */
export default function FilePicker({ onRead }: { onRead: (sheet: ParsedSheet) => void }) {
  const read = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) parseCustomerFile(file).then(onRead, (error: Error) => toast.error(error.message));
  };

  return (
    <SectionCard title="Pick your customer list" description="A file with one customer per row and column titles in the first row, like Name, Mobile, Area.">
      <div className="flex flex-wrap gap-3">
        <Button as="label" size="lg" icon={FileSpreadsheet} className="cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
          Choose a CSV or Excel file
          <input type="file" accept=".csv,.xlsx,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={read} />
        </Button>
        {pickContacts.supported() && (
          <Button size="lg" variant="outline" icon={Contact} onClick={() => pickContacts().then((sheet) => sheet && onRead(sheet), (error: Error) => toast.error(error.message))}>
            From phone contacts
          </Button>
        )}
      </div>
      <p className="mt-4 text-sm text-muted">Up to 2,000 customers at a time. People already saved are found by their mobile number, so nobody is added twice.</p>
    </SectionCard>
  );
}
