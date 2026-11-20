import useGet from '../../../hooks/useGet';
import type Menu from '../../../types/menu';
import SectionCard from '../../../components/section_card';
import ThisPc from './this_pc';
import AgentsCard from './agents_card';

function BrowserPrinters() {
  // The browser-only agent keeps its advanced per-printer routing screen.
  const { data: menu } = useGet<Menu>('/menu');
  return <AgentsCard categories={menu?.categories ?? []} />;
}

/** Native desktop printing follows the Windows default: no duplicate printer setup UI. */
export default function PrintersTab() {
  if ((window as Window & { __RESTORA_DESKTOP__?: boolean }).__RESTORA_DESKTOP__ === true) {
    return (
      <SectionCard title="Built-in printing" description="Uses the printers installed in Windows automatically.">
        <div className="flex flex-col gap-3 px-5 py-4 text-sm text-body sm:px-7">
          <p>For kitchen slips and receipts without an existing assignment, Restora uses your Windows default thermal printer.</p>
          <p>Install the printer and choose your default in Windows. No additional Restora agent or printer settings are required.</p>
          <ThisPc embedded onPaired={() => {}} />
        </div>
      </SectionCard>
    );
  }
  return <BrowserPrinters />;
}
