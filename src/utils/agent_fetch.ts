import AGENT_URL from '../constants/agent_url';

/**
 * A call to the print agent on this PC. Chrome and Edge gate loopback requests behind Local Network Access permission;
 * every request has a deadline so a stopped or unresponsive local process cannot leave the UI waiting forever.
 */
export default function agentFetch(path: string, init: RequestInit = {}, timeoutMs = 5_000): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(new DOMException('The Restora Agent did not respond in time.', 'TimeoutError')),
    timeoutMs,
  );
  const externalSignal = init.signal;
  const abort = () => controller.abort(externalSignal?.reason);
  if (externalSignal?.aborted) abort();
  else externalSignal?.addEventListener('abort', abort, { once: true });

  const options: RequestInit & { targetAddressSpace: 'loopback' } = {
    ...init,
    signal: controller.signal,
    targetAddressSpace: 'loopback',
  };
  return fetch(`${AGENT_URL}${path}`, options).finally(() => {
    window.clearTimeout(timeout);
    externalSignal?.removeEventListener('abort', abort);
  });
}
