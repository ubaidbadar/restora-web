import AGENT_URL from '../constants/agent_url';

/** A local-agent call. Status and pairing must fail visibly instead of leaving setup in a permanent checking state. */
export default function agentFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const timeout = path === '/print' ? 60_000 : path === '/setup/pair' ? 30_000 : 10_000;
  const options: RequestInit & { targetAddressSpace: 'loopback' } = {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(timeout),
    targetAddressSpace: 'loopback',
  };
  return fetch(`${AGENT_URL}${path}`, options);
}
