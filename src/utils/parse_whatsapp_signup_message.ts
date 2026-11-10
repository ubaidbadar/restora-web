/** Parse only Meta's signed-origin Embedded Signup session messages; never trust arbitrary postMessage data. */
export default function parseWhatsAppSignupMessage(origin: string, raw: unknown) {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (host !== 'facebook.com' && !host.endsWith('.facebook.com')) return null;

  let value: unknown = raw;
  if (typeof raw === 'string') {
    try { value = JSON.parse(raw); }
    catch { return null; }
  }
  if (!value || typeof value !== 'object') return null;
  const event = value as { type?: unknown; event?: unknown; data?: unknown };
  if (event.type !== 'WA_EMBEDDED_SIGNUP' || !event.data || typeof event.data !== 'object') return null;
  const data = event.data as Record<string, unknown>;

  if (event.event === 'FINISH') {
    const wabaId = typeof data.waba_id === 'string' ? data.waba_id : '';
    const phoneNumberId = typeof data.phone_number_id === 'string' ? data.phone_number_id : '';
    if (!/^\d{5,30}$/.test(wabaId) || !/^\d{5,30}$/.test(phoneNumberId)) return { event: 'invalid' as const };
    return { event: 'finish' as const, wabaId, phoneNumberId };
  }
  if (event.event === 'CANCEL') return { event: 'cancel' as const };
  if (event.event === 'ERROR') return { event: 'error' as const };
  return null;
}
