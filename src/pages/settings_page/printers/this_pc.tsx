import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../../ui/button';
import useWorkplace from '../../../hooks/useWorkplace';
import agentFetch from '../../../utils/agent_fetch';
import getAxiosMessage from '../../../utils/get_axios_message';
import pairThisPc from '../../../utils/pair_this_pc';
import toast from '../../../utils/toast';

interface ThisPcProps {
  /** Load the authoritative printer list after the agent connects. */
  onPaired: () => void;
  embedded?: boolean;
}

type Step = 'idle' | 'permission' | 'connecting' | 'blocked' | 'missing' | 'disconnected' | 'differentBranch' | 'failed';

/** Browsers must ask permission before the first localhost request. */
async function permission(): Promise<PermissionState> {
  try {
    return (await navigator.permissions.query({ name: 'loopback-network' as PermissionName })).state;
  } catch {
    return 'prompt';
  }
}

/**
 * Connects the local agent with a deadline. A server-side removal is remembered by the agent and requires an explicit
 * reconnect click; normal first-time pairing still happens automatically after permission was previously granted.
 */
export default function ThisPc({ onPaired, embedded = false }: ThisPcProps) {
  const [state, setState] = useState<{ step: Step; message?: string }>({ step: 'idle' });
  const selectedBranchId = useWorkplace()?.branch?._id;

  const connect = async (manual = false, left = () => false) => {
    setState({ step: 'connecting' });
    let status: { paired: boolean; branchId?: string; reconnectRequired?: boolean } | undefined;
    try {
      const response = await agentFetch('/status', {}, 4_000);
      if (response.ok) status = await response.json();
    } catch (error) {
      if (left()) return;
      const message = error instanceof Error && error.name === 'TimeoutError'
        ? 'The local agent did not respond within 4 seconds. Check that Restora Agent is running, then try again.'
        : undefined;
      setState({ step: await permission() === 'denied' ? 'blocked' : 'missing', message });
      return;
    }
    if (left()) return;
    if (!status) {
      setState({ step: await permission() === 'denied' ? 'blocked' : 'missing' });
      return;
    }
    if (status.paired) {
      setState({ step: status.branchId && selectedBranchId && status.branchId !== selectedBranchId
        ? 'differentBranch' : 'idle' });
      return;
    }
    if (status.reconnectRequired && !manual) {
      setState({ step: 'disconnected' });
      return;
    }
    try {
      // The server still verifies a short-lived code; staff never need to type it.
      await pairThisPc();
      if (left()) return;
      setState({ step: 'idle' });
      toast.success(embedded ? 'Restora Desktop printing connected.' : 'Restora Agent connected. Configure your printers below.');
      onPaired();
    } catch (err) {
      if (!left()) setState({ step: 'failed', message: getAxiosMessage(err) });
    }
  };

  useEffect(() => {
    let left = false;
    if (embedded) {
      void connect(false, () => left);
      return () => { left = true; };
    }
    void permission().then(value => {
      if (left) return;
      if (value === 'granted') void connect(false, () => left);
      else setState({ step: value === 'denied' ? 'blocked' : 'permission' });
    });
    return () => { left = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- check once on this setup page
  }, []);

  // Keep the Settings card current while the background agent detects a server-side removal.
  useEffect(() => {
    if (state.step !== 'idle') return;
    let cancelled = false;
    const check = async () => {
      try {
        const response = await agentFetch('/status', {}, 4_000);
        if (!response.ok) return;
        const status = await response.json() as { paired: boolean; branchId?: string; reconnectRequired?: boolean };
        if (cancelled) return;
        if (!status.paired && status.reconnectRequired) setState({ step: 'disconnected' });
        else if (status.paired && status.branchId && selectedBranchId && status.branchId !== selectedBranchId) {
          setState({ step: 'differentBranch' });
        }
      } catch {
        // A temporary local-network permission or process hiccup should not flip a healthy connection to disconnected.
      }
    };
    const timer = window.setInterval(() => void check(), 5_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [state.step, selectedBranchId]);

  if (state.step === 'idle') return null;
  if (state.step === 'connecting') return (
    <p role="status" className="flex max-w-3xl items-center gap-2 rounded-card bg-primary-soft px-4 py-3 text-sm font-medium text-accent-text">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      {embedded ? 'Connecting built-in desktop printing…' : 'Connecting Restora Agent to your restaurant…'}
    </p>
  );
  const message = state.step === 'permission'
    ? 'Connect Restora Agent on this computer. Your browser may ask once to allow access to apps on this device.'
    : state.step === 'blocked'
      ? 'Allow access to apps on this device in the browser site settings, then try again.'
      : state.step === 'missing'
        ? state.message ?? (embedded ? 'Restora Desktop could not reach its built-in printing service. Restart Restora Desktop, then try again.' : 'Restora Agent could not be reached. Open the installed Windows agent, then try again.')
        : state.step === 'disconnected'
          ? 'This PC was disconnected from Restora. It will stay disconnected until you choose to reconnect it.'
          : state.step === 'differentBranch'
            ? 'This PC is connected to a different Restora branch. Remove it from the original branch before connecting it here.'
            : `Restora Agent could not connect: ${state.message}`;
  return (
    <div role="status" className="flex max-w-3xl flex-wrap items-center gap-3 rounded-card bg-primary-soft px-4 py-3">
      <p className="min-w-0 flex-1 basis-60 text-sm text-body">{message}</p>
      <Button size="sm" icon={RefreshCw} onClick={() => void connect(true)}>
        {state.step === 'permission' ? (embedded ? 'Connect printing' : 'Connect this PC') : state.step === 'disconnected' ? 'Reconnect this PC' : 'Try again'}
      </Button>
    </div>
  );
}
