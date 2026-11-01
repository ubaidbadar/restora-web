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
  /** The PC added but not paired yet, if any. */
  agent?: PrintAgent;
  onAdded: (agent: PrintAgent) => void;
  onSaved: (agent: PrintAgent) => void;
  onRefresh: () => void;
}

/**
 * Printing before any PC is paired: three steps, each with the one thing to do in it. Download the agent, name the PC
 * (which gives the code), type the code. When the agent pairs, the page shows its printers instead.
 */
export default function SetupCard({ agent, onAdded, onSaved, onRefresh }: SetupCardProps) {
  return (
    <SectionCard title="Set up printing" description="Kitchen slips and receipts print by themselves from a Windows PC, even when Restora is closed.">
      <ol>
        <SetupStep
          number={1}
          title="Install the print agent on the PC with the printers"
          done={!!agent}
          summary={
            <a href={AGENT_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
              Download again
            </a>
          }
        >
          <Button as="a" href={AGENT_DOWNLOAD_URL} target="_blank" rel="noreferrer" variant="outline" icon={Download}>
            Download for Windows
          </Button>
          <p className="mt-2 text-sm text-muted">Windows 10 or 11. Open the file and it starts by itself.</p>
        </SetupStep>

        <SetupStep number={2} title="Name this PC" done={!!agent} summary={agent?.name}>
          <Form
            schema={agentSchema}
            defaultValues={{ name: 'Counter PC' }}
            noValidate
            className="flex flex-wrap items-start gap-3"
            onSubmit={({ data }) => api.post('/print-agents', data).then((res) => onAdded(res.data))}
            component={({ register, errors, loading, error }) => (
              <>
                <div className="min-w-0 flex-1 basis-48">
                  <Input aria-label="PC name" dir="auto" placeholder="e.g. Counter PC" {...register('name')} error={fieldError(errors, 'name') ?? error} />
                </div>
                <Button type="submit" disabled={loading}>
                  Get pairing code
                </Button>
              </>
            )}
          />
        </SetupStep>

        <SetupStep number={3} title="Type this code into the agent" ahead={!agent?.pairing}>
          {agent?.pairing && <PairingCode agent={{ ...agent, pairing: agent.pairing }} onSaved={onSaved} onRefresh={onRefresh} />}
        </SetupStep>
      </ol>
    </SectionCard>
  );
}
