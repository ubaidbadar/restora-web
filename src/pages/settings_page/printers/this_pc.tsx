import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import Button from '../../../ui/button';
import agentFetch from '../../../utils/agent_fetch';
import getAxiosMessage from '../../../utils/get_axios_message';
import pairThisPc from '../../../utils/pair_this_pc';
import toast from '../../../utils/toast';

interface ThisPcProps {
  /** Load the authoritative printer list after the agent connects. */
  onPaired: () => void;
}

type Step = 'idle' | 'permission' | 'connecting' | 'blocked' | 'missing' | 'failed';

/** Browsers must ask permission before the first localhost request. */
async function permission(): Promise<PermissionState> {
  try {
    return (await navigator.permissions.query({ name: 'loopback-network' as PermissionName })).state;
  } catch {
    return 'prompt';
  }
}

/**
 * Opening Restora Agent takes staff to this page. With previously granted loopback
 * permission, it connects without a click. On first use one clear button triggers
 * the browser permission prompt; the six-digit backend credential stays invisible.
 */
export default function ThisPc({ onPaired }: ThisPcProps) {
  const [state, setState] = useState<{ step: Step; message?: string }>({ step: 'idle' });

  const connect = async (left = () => false) => {
    setState({ step: 'connecting' });
    const status = await agentFetch('/status')
      .then(async res => res.ok ? res.json() as Promise<{ paired: boolean }> : undefined)
      .catch(() => undefined);
    if (left()) return;
    if (!status) {
      setState({ step: await permission() === 'denied' ? 'blocked' : 'missing' });
      return;
    }
    if (status.paired) {
      setState({ step: 'idle' });
      return;
    }
    try {
      // The server still verifies a short-lived code; staff never need to type it.
      await pairThisPc();
      if (left()) return;
      setState({ step: 'idle' });
      toast.success('Restora Agent connected. Configure your printers below.');
      onPaired();
    } catch (err) {
      if (!left()) setState({ step: 'failed', message: getAxiosMessage(err) });
    }
  };

  useEffect(() => {
    let left = false;
    void permission().then(value => {
      if (left) return;
      if (value === 'granted') void connect(() => left);
      else setState({ step: value === 'denied' ? 'blocked' : 'permission' });
    });
    return () => { left = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- check once on this setup page
  }, []);

  if (state.step === 'idle') return null;
  if (state.step === 'connecting') return (
    <p role="status" className="flex max-w-3xl items-center gap-2 rounded-card bg-primary-soft px-4 py-3 text-sm font-medium text-accent-text">
      <span className="size-2 shrink-0 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      Connecting Restora Agent to your restaurant…
    </p>
  );
  const message = state.step === 'permission'
    ? 'Connect Restora Agent on this computer. Your browser may ask once to allow access to apps on this device.'
    : state.step === 'blocked'
      ? 'Allow access to apps on this device in the browser site settings, then try again.'
      : state.step === 'missing'
        ? 'Restora Agent could not be reached. Open the installed Windows agent, then try again.'
        : `Restora Agent could not connect: ${state.message}`;
  return (
    <div role="status" className="flex max-w-3xl flex-wrap items-center gap-3 rounded-card bg-primary-soft px-4 py-3">
      <p className="min-w-0 flex-1 basis-60 text-sm text-body">{message}</p>
      <Button size="sm" icon={RefreshCw} onClick={() => void connect()}>
        {state.step === 'permission' ? 'Connect this PC' : 'Try again'}
      </Button>
    </div>
  );
}
