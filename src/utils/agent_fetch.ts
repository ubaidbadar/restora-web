import AGENT_URL from '../constants/agent_url';

/**
 * A call to the print agent on this PC. Chrome and Edge ask once whether Restora may reach apps on this device (Local
 * Network Access); `targetAddressSpace` tells them the call is meant for this PC, so it is not refused as mixed content.
 */
export default function agentFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const options: RequestInit & { targetAddressSpace: 'loopback' } = { ...init, targetAddressSpace: 'loopback' };
  return fetch(`${AGENT_URL}${path}`, options);
}
