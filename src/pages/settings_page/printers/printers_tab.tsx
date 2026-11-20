import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import useGet from '../../../hooks/useGet';
import type Menu from '../../../types/menu';
import SectionCard from '../../../components/section_card';
import AgentsCard from './agents_card';

interface NativePrinter {
  name: string;
  isDefault: boolean;
}

function NativePrinters() {
  const [printers, setPrinters] = useState<NativePrinter[]>([]);
  const [error, setError] = useState<string>();
  useEffect(() => {
    let left = false;
    void invoke<NativePrinter[]>('native_printers')
      .then((found) => { if (!left) setPrinters(found); })
      .catch((reason) => { if (!left) setError(String(reason)); });
    return () => { left = true; };
  }, []);
  const defaultPrinter = printers.find((printer) => printer.isDefault);
  return (
    <SectionCard title="Windows printing" description="Built directly into Restora POS. No agent, pairing code, or local server.">
      <div className="flex flex-col gap-3 px-5 py-4 text-sm text-body sm:px-7">
        <p>Kitchen slips and receipts print directly to your Windows default ESC/POS thermal printer.</p>
        {error ? <p role="alert" className="text-danger-700">{error}</p> :
          defaultPrinter ? <p role="status">Default printer: <strong>{defaultPrinter.name}</strong></p> :
            <p role="status">No Windows default printer detected. Install your thermal printer and set it as default in Windows Settings.</p>}
        {printers.length > 0 && (
          <p className="text-muted">Windows detected {printers.length} installed printer{printers.length === 1 ? '' : 's'} without needing a test print.</p>
        )}
      </div>
    </SectionCard>
  );
}

function BrowserPrinters() {
  const { data: menu } = useGet<Menu>('/menu');
  return <AgentsCard categories={menu?.categories ?? []} />;
}

export default function PrintersTab() {
  return (window as Window & { __RESTORA_DESKTOP__?: boolean }).__RESTORA_DESKTOP__ === true
    ? <NativePrinters />
    : <BrowserPrinters />;
}
