import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';
import api from '../../../config/api';
import type PrintAgent from '../../../types/print_agent';
import Button from '../../../ui/button';
import formatTime from '../../../utils/format_time';
import getAxiosMessage from '../../../utils/get_axios_message';
import minutesSince from '../../../utils/minutes_since';
import toast from '../../../utils/toast';

/** How often the page asks whether the agent has paired, while the code is still good. */
const CHECK_EVERY_MS = 5000;

interface PairingCodeProps {
  agent: PrintAgent & { pairing: NonNullable<PrintAgent['pairing']> };
  onSaved: (agent: PrintAgent) => void;
  /** Reads the agents again, to see whether this one has paired. */
  onRefresh: () => void;
}

/**
 * The six digits to type into the agent, large and one per box so they are easy to read across a counter. The page
 * checks by itself every few seconds; once the code runs out, one tap makes a new one.
 */
export default function PairingCode({ agent, onSaved, onRefresh }: PairingCodeProps) {
  const expired = minutesSince(agent.pairing.expiresAt) >= 0;

  useEffect(() => {
    if (expired) return;
    const timer = window.setInterval(onRefresh, CHECK_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [expired, onRefresh]);

  return (
    <div className="flex flex-col gap-3">
      <p className="flex gap-1.5 sm:gap-2" aria-label={expired ? 'Code expired' : `Pairing code ${agent.pairing.code.split('').join(' ')}`}>
        {agent.pairing.code.split('').map((digit, index) => (
          <span
            key={index}
            aria-hidden="true"
            className={`grid h-14 w-11 place-items-center rounded-control border text-2xl font-semibold tabular-nums sm:w-12 ${expired ? 'border-border bg-sunken text-muted line-through' : 'border-border-strong bg-surface text-ink'}`}
          >
            {digit}
          </span>
        ))}
      </p>
      {expired ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm text-muted">This code has run out.</p>
          <Button
            size="sm"
            icon={RefreshCw}
            onClick={() =>
              api
                .post(`/print-agents/${agent._id}/code`)
                .then((res) => onSaved(res.data))
                .catch((err) => toast.error(getAxiosMessage(err)))
            }
          >
            New code
          </Button>
        </div>
      ) : (
        <p className="flex items-start gap-2 text-sm text-muted" role="status">
          <span className="mt-1.5 size-2 shrink-0 animate-pulse rounded-full bg-warning-500" aria-hidden="true" />
          Waiting for the agent · code works until {formatTime(agent.pairing.expiresAt)}
        </p>
      )}
    </div>
  );
}
