import { useEffect } from 'react';
import agentFetch from '../../utils/agent_fetch';
import pairThisPc from '../../utils/pair_this_pc';
import toast from '../../utils/toast';

/**
 * On a PC whose browser already lets Restora reach the print agent (Chrome asked once, on Settings → Printers), an agent
 * that is not paired, e.g. installed again, pairs by itself when Restora opens: nobody goes to Settings. Elsewhere it
 * checks nothing, so no other phone or laptop is ever asked about devices on its network.
 */
export default function AgentReconnect() {
  useEffect(() => {
    // Opened twice in development (Strict Mode): only the second check goes on to pair.
    let left = false;
    void (async () => {
      try {
        // Settings → Printers pairs it itself, and says why when it can't.
        if (window.location.pathname.startsWith('/settings/printers')) return;
        const permission = await navigator.permissions.query({ name: 'loopback-network' as PermissionName });
        if (permission.state !== 'granted') return;
        const status = (await (await agentFetch('/status')).json()) as { paired: boolean };
        if (left || status.paired) return;
        await pairThisPc();
        toast.success('The print agent on this PC is connected again.');
      } catch {
        // No agent here, a browser without this permission, or it could not pair: Settings → Printers shows why.
      }
    })();
    return () => {
      left = true;
    };
  }, []);
  return null;
}
