import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import type PrintAgent from '../../../types/print_agent';
import Button from '../../../ui/button';
import agentFetch from '../../../utils/agent_fetch';
import getAxiosMessage from '../../../utils/get_axios_message';
import minutesSince from '../../../utils/minutes_since';
import pairThisPc from '../../../utils/pair_this_pc';
import toast from '../../../utils/toast';

interface ThisPcProps {
  /** A PC added here but not paired yet: its code is used instead of making another. */
  waiting?: PrintAgent;
  /** Reads the PCs again once this one has paired. */
  onPaired: () => void;
}

type Step = 'idle' | 'connecting' | 'blocked' | 'failed';

/** Whether the browser has been told never to let Restora reach apps on this PC. */
async function blocked() {
  try {
    return (await navigator.permissions.query({ name: 'loopback-network' as PermissionName })).state === 'denied';
  } catch {
    return false;
  }
}

/**
 * The print agent on the PC this page is open on, when it has not paired yet, pairs by itself: the page makes the code
 * and hands it to the agent, so nobody types it. The agent's "Connect to Restora" button opens this page.
 * Shows nothing when there is no agent here or it is paired already. Once the browser allows it, any page reconnects
 * the agent too (hoc/app_layout/agent_reconnect).
 */
export default function ThisPc({ waiting, onPaired }: ThisPcProps) {
  const [state, setState] = useState<{ step: Step; message?: string }>({ step: 'idle' });

  const connect = async (left = () => false) => {
    const status = await agentFetch('/status')
      .then((res) => res.json() as Promise<{ paired: boolean }>)
      .catch(() => undefined);
    if (left()) return;
    if (!status) return setState({ step: (await blocked()) ? 'blocked' : 'idle' });
    if (status.paired) return setState({ step: 'idle' });

    setState({ step: 'connecting' });
    try {
      await pairThisPc(waiting?.pairing && minutesSince(waiting.pairing.expiresAt) < 0 ? waiting.pairing.code : undefined);
      setState({ step: 'idle' });
      toast.success('This PC is connected. Name its printers below.');
      onPaired();
    } catch (err) {
      setState({ step: 'failed', message: getAxiosMessage(err) });
    }
  };

  useEffect(() => {
    // Opened twice in development (Strict Mode): only the second check goes on to pair.
    let left = false;
    void connect(() => left);
    return () => {
      left = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once, when the page opens
  }, []);

  if (state.step === 'idle') return null;
  if (state.step === 'connecting') {
    return (
      <p role="status" className="flex max-w-3xl items-center gap-2 rounded-card bg-primary-soft px-4 py-3 text-sm font-medium text-accent-text">
        <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden="true" />
        Connecting the print agent on this PC…
      </p>
    );
  }
  return (
    <div role="alert" className="flex max-w-3xl flex-wrap items-center gap-3 rounded-card bg-danger-50 px-4 py-3">
      <p className="min-w-0 flex-1 basis-60 text-sm text-danger-800">
        {state.step === 'blocked'
          ? 'This browser is blocking Restora from the print agent on this PC. Click the icon at the start of the address bar, allow access to devices on your network, then try again.'
          : `The print agent on this PC could not connect: ${state.message}`}
      </p>
      <Button size="sm" variant="outline" icon={RefreshCw} onClick={() => void connect()}>
        Try again
      </Button>
    </div>
  );
}
