import { useWatch, type Control, type FieldValues } from 'react-hook-form';
import SectionCard from '../../components/section_card';
import type ParsedSheet from '../../types/parsed_sheet';
import formatRs from '../../utils/format_rs';
import importRows from '../../utils/import_rows';
import normalizePhone from '../../utils/normalize_phone';

interface ImportPreviewProps {
  sheet: ParsedSheet;
  control: Control<FieldValues>;
}

/** The first rows as they will be saved, and how many rows look usable, so a wrong column shows before importing. */
export default function ImportPreview({ sheet, control }: ImportPreviewProps) {
  const mapping = useWatch({ control }) as Record<string, string>;
  const rows = importRows(sheet.rows, mapping);
  const usable = rows.filter((row) => row.name && row.phone && normalizePhone(row.phone)).length;

  return (
    <SectionCard title="Preview" description={`${usable} of ${rows.length} rows have a name and a mobile number. The others will be skipped and listed after.`} flush>
      <div className="overflow-x-auto">
        <table className="w-full text-start text-sm">
          <thead className="bg-sunken/50 text-muted">
            <tr>
              {['Name', 'Mobile', 'Area', 'Khata'].map((title) => (
                <th key={title} scope="col" className="px-4 py-2 text-start font-medium">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.slice(0, 5).map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 text-ink">{row.name ?? <span className="text-danger-700">No name</span>}</td>
                <td className="px-4 py-2 tabular-nums">{row.phone ? (normalizePhone(row.phone) ?? <span className="text-danger-700">{row.phone}?</span>) : <span className="text-danger-700">None</span>}</td>
                <td className="px-4 py-2">{row.area}</td>
                <td className="px-4 py-2 tabular-nums">{row.openingKhata ? formatRs(row.openingKhata) : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
