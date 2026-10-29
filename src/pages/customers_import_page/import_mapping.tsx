import Tabs from '../../ui/tabs';
import SectionCard from '../../components/section_card';
import IMPORT_FIELDS from '../../constants/import_fields';
import type ImportAnswer from '../../types/import_answer';
import type ParsedSheet from '../../types/parsed_sheet';
import Button from '../../ui/button';
import Form from '../../ui/form';
import Select from '../../ui/select';
import fieldError from '../../utils/field_error';
import importRows from '../../utils/import_rows';
import api from '../../config/api';
import importSchema from './import_schema';
import ImportPreview from './import_preview';

interface ImportMappingProps {
  sheet: ParsedSheet;
  onDone: (result: ImportAnswer) => void;
  onBack: () => void;
}

const EXISTING = [
  { value: 'skip', label: 'Leave them as they are' },
  { value: 'fill', label: 'Fill in their empty details' },
];

/** For each detail, the column whose title sounds like it ('' when none does). Each column is used once. */
const guessColumns = (headers: string[]) => {
  const used = new Set<number>();
  return Object.fromEntries(
    IMPORT_FIELDS.map(({ key, hints }) => {
      const index = headers.findIndex((header, position) => !used.has(position) && hints.some((hint) => header.toLowerCase().includes(hint)));
      if (index >= 0) used.add(index);
      return [key, index >= 0 ? String(index) : ''];
    }),
  ) as Record<(typeof IMPORT_FIELDS)[number]['key'], string>;
};

/** Columns are guessed from their titles; fix any guess, check the preview, then import. */
export default function ImportMapping({ sheet, onDone, onBack }: ImportMappingProps) {
  const columns = [{ value: '', label: 'Not in this file' }, ...sheet.headers.map((header, index) => ({ value: String(index), label: header }))];

  return (
    <Form
      schema={importSchema}
      defaultValues={{ ...guessColumns(sheet.headers), onExisting: 'skip' }}
      noValidate
      className="flex flex-col gap-4"
      onSubmit={({ data, onSuccess, onError }) => {
        const { onExisting, ...mapping } = data;
        // Every row goes, in sheet order, so the row numbers the server reports match the file.
        const rows = importRows(sheet.rows, mapping);
        api
          .post('/customers/import', { customers: rows, onExisting })
          .then((res) => {
            onSuccess('');
            onDone(res.data);
          })
          .catch(onError);
      }}
      component={(form) => (
        <>
          <SectionCard title={`${sheet.fileName} · ${sheet.rows.length} rows`} description="Which column holds each detail?">
            <div className="grid gap-4 sm:grid-cols-2">
              {IMPORT_FIELDS.map((field) => (
                <Select key={field.key} label={field.label} required={field.required} options={columns} {...form.register(field.key)} error={fieldError(form.errors, field.key)} />
              ))}
            </div>
            <fieldset className="mt-5 flex flex-col gap-2">
              <legend className="mb-2">People already saved (same mobile number)</legend>
              <Tabs register={form.register} name="onExisting" label="People already saved" options={EXISTING} value="skip" wrap />
            </fieldset>
          </SectionCard>
          <ImportPreview sheet={sheet} control={form.control} />
          {form.error && <p role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">{form.error}</p>}
          <div className="flex flex-wrap justify-between gap-3">
            <Button type="button" variant="ghost" onClick={onBack}>
              Pick another file
            </Button>
            <Button type="submit" size="lg" disabled={form.loading}>
              {form.loading ? 'Importing…' : `Import ${sheet.rows.length} rows`}
            </Button>
          </div>
        </>
      )}
    />
  );
}
