import { RefreshCw, Trash2 } from 'lucide-react';
import api from '../../../config/api';
import type MenuCategory from '../../../types/menu_category';
import type PrintAgent from '../../../types/print_agent';
import AlertModal from '../../../ui/alert_modal/modal';
import Badge from '../../../ui/badge';
import Button from '../../../ui/button';
import IconButton from '../../../ui/icon_button';
import formatAgo from '../../../utils/format_ago';
import getAxiosMessage from '../../../utils/get_axios_message';
import minutesSince from '../../../utils/minutes_since';
import toast from '../../../utils/toast';
import BranchName from '../devices/branch_name';
import PrinterRow from './printer_row';

interface AgentRowProps {
  agent: PrintAgent;
  categories: MenuCategory[];
  onSaved: (agent: PrintAgent) => void;
  onRemoved: (id: string) => void;
  /** Reads the agents again: the person asks, to see that the agent has paired. */
  onRefresh: () => void;
}

/** An agent is online while it has been heard from in the last two minutes. */
const ONLINE_MINUTES = 2;

/** One PC with a print agent: its state, the pairing code while it waits, and its printers. */
export default function AgentRow({ agent, categories, onSaved, onRemoved, onRefresh }: AgentRowProps) {
  const waiting = !agent.lastSeenAt;
  const online = !!agent.lastSeenAt && minutesSince(agent.lastSeenAt) < ONLINE_MINUTES;
  const expired = !!agent.pairing && minutesSince(agent.pairing.expiresAt) >= 0;

  return (
    <li className="py-3">
      <div className="flex items-center justify-between gap-2 ps-5 pe-3 sm:ps-6 sm:pe-4">
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <bdi className="truncate font-medium text-ink">{agent.name}</bdi>
            {waiting ? <Badge variant="warning">Waiting for pairing</Badge> : <Badge variant={online ? 'success' : 'neutral'}>{online ? 'Online' : 'Offline'}</Badge>}
          </span>
          <span className="block truncate text-sm text-muted">
            <BranchName id={agent.branchId} />
            {agent.version && ` · version ${agent.version}`}
            {agent.lastSeenAt && !online && ` · seen ${formatAgo(agent.lastSeenAt).toLowerCase()}`}
          </span>
        </span>
        <AlertModal
          title={`Remove ${agent.name}?`}
          description="It stops printing at once. Add the PC again to pair it with a new code."
          confirmText="Remove"
          onConfirm={() =>
            api
              .delete(`/print-agents/${agent._id}`)
              .then(() => {
                onRemoved(agent._id);
                toast.success(`${agent.name} removed`);
              })
              .catch((err) => toast.error(getAxiosMessage(err)))
          }
          component={({ open }) => <IconButton icon={Trash2} className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Remove ${agent.name}`} onClick={open} />}
        />
      </div>

      {agent.pairing && (
        <div className="mx-5 mt-3 flex flex-wrap items-center justify-between gap-3 rounded-control bg-sunken px-4 py-3 sm:mx-6">
          <span>
            <span className="block text-sm text-muted">{expired ? 'This code has expired.' : 'Type this code into the agent:'}</span>
            <span className="block text-2xl font-semibold tracking-widest text-ink tabular-nums">{expired ? '------' : agent.pairing.code}</span>
          </span>
          <span className="flex gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRefresh}>
              Check again
            </Button>
            {expired && (
              <Button
                size="sm"
                onClick={() =>
                  api
                    .post(`/print-agents/${agent._id}/code`)
                    .then((res) => onSaved(res.data))
                    .catch((err) => toast.error(getAxiosMessage(err)))
                }
              >
                New code
              </Button>
            )}
          </span>
        </div>
      )}

      {!waiting && !agent.printers.length && <p className="px-5 pt-2 text-sm text-muted sm:px-6">The agent has not listed any printers yet.</p>}
      <ul className="mt-1 divide-y divide-border">
        {agent.printers.map((printer) => (
          <PrinterRow key={printer.systemName} agent={agent} printer={printer} categories={categories} onSaved={onSaved} />
        ))}
      </ul>
    </li>
  );
}
