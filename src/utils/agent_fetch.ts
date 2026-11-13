import AGENT_URL from '../constants/agent_url';

/** A local-agent call. Status and pairing fail visibly instead of leaving setup waiting forever. */
export default function agentFetch(path: string, init: RequestInit = {}, timeoutMs?: number): Promise<Response> {
  const timeout = timeoutMs ?? (path === '/print' ? 60_000 : path === '/setup/pair' ? 30_000 : 10_000);
  const options: RequestInit & { targetAddressSpace: 'loopback' } = {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(timeout),
    targetAddressSpace: 'loopback',
  };
  return fetch(`${AGENT_URL}${path}`, options);
}
