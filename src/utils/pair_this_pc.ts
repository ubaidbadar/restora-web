import api from '../config/api';
import apiOrigin from '../constants/api_origin';
import type PrintAgent from '../types/print_agent';
import agentFetch from './agent_fetch';

/**
 * Pairs the print agent on this PC with this branch, so nobody types a code: makes the code (or uses `code`, one
 * still waiting) and hands it to the agent with the API this site uses (the dev site pairs it with the dev API).
 * Throws with the reason when it does not pair.
 */
export default async function pairThisPc(code?: string): Promise<void> {
  const pairing = code ?? (await api.post<PrintAgent>('/print-agents', { name: 'Counter PC' })).data.pairing?.code;
  const res = await agentFetch('/setup/pair', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: pairing, api: apiOrigin ? `${apiOrigin}/api/v1` : undefined }),
  }, 20_000);
  if (!res.ok) throw new Error(((await res.json()) as { message?: string }).message ?? 'The print agent could not connect.');
}
