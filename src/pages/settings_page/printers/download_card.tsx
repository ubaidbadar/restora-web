import { Download } from 'lucide-react';
import SectionCard from '../../../components/section_card';
import AGENT_DOWNLOAD_URL from '../../../constants/agent_download_url';
import Button from '../../../ui/button';

/** Where to get the Windows app that prints the kitchen slips and receipts. */
export default function DownloadCard() {
  return (
    <SectionCard
      title="Print agent for Windows"
      description="Install it on the PC the printers are connected to. It prints new orders by itself, even when this page is closed."
      action={
        <Button as="a" href={AGENT_DOWNLOAD_URL} target="_blank" rel="noreferrer" icon={Download}>
          Download
        </Button>
      }
    >
      <ol className="list-decimal space-y-1 ps-5 text-sm text-body">
        <li>Download and install the agent on the PC.</li>
        <li>Add the PC below to get a pairing code.</li>
        <li>Type the code into the agent. Its printers then show up here.</li>
      </ol>
    </SectionCard>
  );
}
