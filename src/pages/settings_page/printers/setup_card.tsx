import { Download } from 'lucide-react';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import AGENT_DOWNLOAD_URL from '../../../constants/agent_download_url';
import type PrintAgent from '../../../types/print_agent';
import Button from '../../../ui/button';
import Form from '../../../ui/form';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import agentSchema from './agent_schema';
import PairingCode from './pairing_code';
import SetupStep from './setup_step';

interface SetupCardProps {
  embedded?: boolean;
  agent?: PrintAgent;
  onAdded: (agent: PrintAgent) => void;
  onSaved: (agent: PrintAgent) => void;
  onRefresh: () => void;
}

/** The normal path uses authenticated Restora + a one-time browser permission, not a code. */
export default function SetupCard({ agent, embedded = false, onAdded, onSaved, onRefresh }: SetupCardProps) {
  return (
    <SectionCard title="Set up printing"
      description={embedded
        ? 'Printing is included with Restora Desktop. No separate agent or installer is needed.'
        : 'Install the Windows agent once. Then Restora sends kitchen slips and receipts to your printers automatically.'}>
      {embedded ? (
        <p className="text-sm text-body">
          Your desktop app starts the print engine automatically. Restora connects this PC to your selected branch
          and lets you choose printers for kitchen slips and receipts. If connection fails, use Try again above.
        </p>
      ) : (
        <>
          <ol>
        <SetupStep number={1} title="Install Restora Agent" done={!!agent?.lastSeenAt}
          summary={<a href={AGENT_DOWNLOAD_URL} target="_blank" rel="noreferrer"
            className="font-medium text-primary hover:underline">Open Microsoft Store</a>}>
          <Button as="a" href={AGENT_DOWNLOAD_URL} target="_blank" rel="noreferrer"
            variant="outline" icon={Download}>Get Restora Agent for Windows</Button>
          <p className="mt-2 text-sm text-muted">Windows 10 or 11. Open Restora Agent after installing it.</p>
        </SetupStep>
        <SetupStep number={2} title="Open Restora and connect this PC" done={!!agent?.lastSeenAt}>
          <p className="text-sm text-body">
            Restora Agent opens this website. Sign in, choose your restaurant branch, then allow your browser
            to access the agent when asked. Restora connects the PC without a code.
          </p>
          <p className="mt-2 text-sm text-muted">
            Then choose which printers should receive kitchen slips and customer receipts.
          </p>
        </SetupStep>
      </ol>
      <details className="border-t border-border px-5 py-4 sm:px-7">
        <summary className="cursor-pointer text-sm font-medium text-muted">
          Advanced: connect another PC using a code
        </summary>
        <p className="mt-3 text-sm text-muted">
          Only use this when the browser cannot reach the Windows agent, or when setting up a different PC.
        </p>
        <Form
          schema={agentSchema}
          defaultValues={{ name: 'Counter PC' }}
          noValidate
          className="mt-3 flex flex-wrap items-start gap-3"
          onSubmit={({ data }) => api.post('/print-agents', data).then(res => onAdded(res.data))}
          component={({ register, errors, loading, error }) => (
            <>
              <div className="min-w-0 flex-1 basis-48">
                <Input aria-label="PC name" dir="auto" placeholder="e.g. Counter PC"
                  {...register('name')} error={fieldError(errors, 'name') ?? error} />
              </div>
              <Button type="submit" disabled={loading}>Get connection code</Button>
            </>
          )}
        />
        {agent?.pairing && <div className="mt-3">
          <PairingCode agent={{ ...agent, pairing: agent.pairing }}
            onSaved={onSaved} onRefresh={onRefresh} />
        </div>}
      </details>
        </>
      )}
    </SectionCard>
  );
}
