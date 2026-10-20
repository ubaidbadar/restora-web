import { useState } from 'react';
import PageHeader from '../../components/page_header';
import type ImportAnswer from '../../types/import_answer';
import type ParsedSheet from '../../types/parsed_sheet';
import FilePicker from './file_picker';
import ImportMapping from './import_mapping';
import ImportResult from './import_result';

/** Pick a file (or phone contacts), say which column is what, check the preview, import. The step follows from what is set. */
export default function CustomersImportPage() {
  const [step, setStep] = useState<{ sheet?: ParsedSheet; result?: ImportAnswer }>({});

  return (
    <>
      <PageHeader title="Import customers" subtitle="From a CSV or Excel file, or your phone's contacts" />
      {step.result ? (
        <ImportResult result={step.result} onAgain={() => setStep({})} />
      ) : step.sheet ? (
        <ImportMapping sheet={step.sheet} onDone={(result) => setStep({ result })} onBack={() => setStep({})} />
      ) : (
        <FilePicker onRead={(sheet) => setStep({ sheet })} />
      )}
    </>
  );
}
