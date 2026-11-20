import { useEffect } from 'react';
import agentFetch from '../../utils/agent_fetch';
import pairThisPc from '../../utils/pair_this_pc';
import useAuthStore from '../../store/auth_store';
import toast from '../../utils/toast';

/**
 * Desktop includes its own native print worker: pair it after sign-in without
 * ever opening printer settings. Browser users still need an already granted
 * loopback permission to talk to a separately installed agent.
 */
export default function AgentReconnect() {
  useEffect(() => {
    let left = false;
    void (async () => {
      const desktop = (window as Window & { __RESTORA_DESKTOP__?: boolean }).__RESTORA_DESKTOP__ === true;
      try {
        // The Settings status component owns pairing on this route; avoid
        // two simultaneous one-time-code requests in React Strict Mode.
        if (window.location.pathname.startsWith('/settings/printers')) return;
        if (!desktop) {
          const permission = await navigator.permissions.query({ name: 'loopback-network' as PermissionName });
          if (permission.state !== 'granted') return;
        }
        const response = await agentFetch('/status');
        if (!response.ok) return;
        const status = (await response.json()) as { paired: boolean; branchId?: string; reconnectRequired?: boolean };
        if (left) return;
        const selectedBranch = useAuthStore.getState().me?.workplace?.branch?._id;
        if (status.paired) {
          if (desktop && status.branchId && selectedBranch && status.branchId !== selectedBranch) {
            toast.error('Printing is connected to another branch. Ask a manager to reconnect this PC.');
          }
          return;
        }
        if (status.reconnectRequired) {
          if (desktop) toast.error('Printing was disconnected. Reconnect this PC under Settings → Printing.');
          return;
        }
        await pairThisPc();
        if (!left) toast.success(desktop ? 'Built-in printing connected.' : 'The print agent on this PC is connected again.');
      } catch {
        if (desktop && !left) toast.error('Built-in printing could not connect. Check Settings → Printing.');
      }
    })();
    return () => { left = true; };
  }, []);
  return null;
}
