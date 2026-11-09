import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../config/api';
import SectionCard from '../../../components/section_card';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import getAxiosMessage from '../../../utils/get_axios_message';
import useGet from '../../../hooks/useGet';
import useAuthStore from '../../../store/auth_store';

type Connection = {
  _id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
};
type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };
type MetaLoginResponse = { authResponse?: { code?: string } };
type MetaSDK = {
  init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (callback: (response: MetaLoginResponse) => void, options: Record<string, unknown>) => void;
};
declare global {
  interface Window { FB?: MetaSDK; fbAsyncInit?: () => void }
}

let sdkPromise: Promise<void> | undefined;
function loadMetaSDK(appId: string): Promise<void> {
  if (window.FB) {
    window.FB.init({ appId, cookie: true, xfbml: false, version: 'v26.0' });
    return Promise.resolve();
  }
  if (!sdkPromise) sdkPromise = new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => { sdkPromise = undefined; reject(new Error('Meta signup could not load. Check browser privacy settings.')); }, 15000);
    window.fbAsyncInit = () => {
      window.clearTimeout(timer);
      window.FB?.init({ appId, cookie: true, xfbml: false, version: 'v26.0' });
      resolve();
    };
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      window.clearTimeout(timer);
      sdkPromise = undefined;
      reject(new Error('Unable to reach Meta signup.'));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

type MetaFinish = { wabaId: string; phoneNumberId?: string };

export default function WhatsAppTab() {
  const { data: config, loading: configLoading, error: configError } = useGet<SignupConfig>('/whatsapp/signup/config');
  const { data: connections = [], loading, get } = useGet<Connection[]>('/whatsapp/connections');
  const [busy, setBusy] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [registering, setRegistering] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const workplace = useAuthStore(state => state.me?.workplace);
  const hasBranch = Boolean(workplace?.branch?._id);
  const [feedback, setFeedback] = useState('');
  const codeRef = useRef('');
  const finishRef = useRef<MetaFinish | null>(null);
  const startedRef = useRef(false);

  // Preload the SDK before the user clicks. Facebook's popup must be opened
  // synchronously from a real user gesture or browsers may block it.
  useEffect(() => {
    if (!config?.enabled || !config.appId) return;
    let active = true;
    setSdkReady(false);
    void loadMetaSDK(config.appId).then(() => { if (active) setSdkReady(true); },
      () => { if (active) setFeedback('Meta signup could not load. Check your browser privacy settings and refresh.'); });
    return () => { active = false; };
  }, [config?.enabled, config?.appId]);

  const complete = useCallback(async () => {
    const code = codeRef.current;
    const ids = finishRef.current;
    if (!startedRef.current || !code || !ids) return;
    startedRef.current = false;
    try {
      const res = await api.post('/whatsapp/signup/complete', { code, ...ids });
      get();
      setFeedback(res.data.status === 'connected'
        ? 'Your WhatsApp number is connected and ready.'
        : 'Meta authorized the number. Complete registration with a six-digit PIN below.');
      toast.success('WhatsApp authorization saved');
    } catch (error) {
      setFeedback(getAxiosMessage(error));
      toast.error(getAxiosMessage(error));
    } finally {
      codeRef.current = '';
      finishRef.current = null;
      setBusy(false);
    }
  }, [get]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      // Meta Embedded Signup session information is only trusted from Meta.
      if (!['https://www.facebook.com', 'https://web.facebook.com', 'https://business.facebook.com'].includes(event.origin)) return;
      let payload: unknown = event.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { return; }
      }
      if (!payload || typeof payload !== 'object') return;
      const result = payload as { type?: string; event?: string; data?: { waba_id?: string; phone_number_id?: string } };
      if (result.type !== 'WA_EMBEDDED_SIGNUP') return;
      if (result.event === 'CANCEL' || result.event === 'ERROR') {
        setBusy(false);
        startedRef.current = false;
        setFeedback(result.event === 'CANCEL' ? 'WhatsApp setup cancelled.' : 'Meta could not finish setup. Try again.');
        return;
      }
      if (!['FINISH', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'].includes(result.event || '')) return;
      if (!result.data?.waba_id) {
        setFeedback('Meta did not return a WhatsApp Business Account. Restart signup or contact support.');
        setBusy(false);
        return;
      }
      finishRef.current = { wabaId: result.data.waba_id, phoneNumberId: result.data.phone_number_id };
      void complete();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [complete]);

  const connect = () => {
    if (!config?.enabled || !config.appId || !config.configId || !hasBranch || !sdkReady || !window.FB) return;
    setBusy(true);
    setFeedback('Opening secure Meta signup…');
    codeRef.current = '';
    finishRef.current = null;
    startedRef.current = true;
    try {
      window.FB.login((response) => {
        if (!response.authResponse?.code) {
          setBusy(false);
          startedRef.current = false;
          setFeedback('Meta did not grant access. Close the popup and retry.');
          return;
        }
        codeRef.current = response.authResponse.code;
        setFeedback('Meta authorized the account. Finalizing the phone number…');
        void complete();
      }, {
        config_id: config.configId,
        response_type: 'code',
        override_default_response_type: true,
        auth_type: 'rerequest',
      });
    } catch (error) {
      setBusy(false);
      startedRef.current = false;
      setFeedback(error instanceof Error ? error.message : 'Meta signup could not start');
    }
  };

  const register = async (id: string) => {
    setRegistering(id);
    try {
      await api.post(`/whatsapp/connections/${id}/register`, { pin });
      setPin('');
      setFeedback('Phone registered. WhatsApp ordering is ready.');
      get();
    } catch (error) { setFeedback(getAxiosMessage(error)); }
    finally { setRegistering(null); }
  };

  const disconnect = async (id: string) => {
    if (!window.confirm('Disconnect this WhatsApp number from Restora? Future replies will stop until you reconnect it.')) return;
    setBusy(true);
    try {
      await api.post(`/whatsapp/connections/${id}/disconnect`);
      get();
      toast.success('WhatsApp disconnected from Restora');
    } catch (error) { toast.error(getAxiosMessage(error)); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-5">
      <SectionCard title="WhatsApp Business" description="Connect your restaurant's own WhatsApp Business number through Meta. Customer chats and confirmed orders will be handled inside Restora.">
        <div className="flex flex-col gap-3">
          {configError && <p role="alert" className="text-sm text-danger-600">{configError}</p>}
          {config && !config.enabled && (
            <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
              WhatsApp signup is not configured by Restora yet. Contact support to enable your Meta integration.
            </p>
          )}
          {!hasBranch && <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">Choose a specific restaurant branch before connecting WhatsApp.</p>}
          <div>
            <Button onClick={() => void connect()} disabled={busy || configLoading || !config?.enabled || !hasBranch || !sdkReady}>
              {busy ? 'Connecting to Meta…' : !sdkReady && config?.enabled ? 'Loading Meta signup…' : 'Connect WhatsApp Business'}
            </Button>
          </div>
          <p className="text-sm text-muted">You will sign in to your own Facebook Business account. Restora never receives your Facebook password. An existing WhatsApp Business app number may require Meta's coexistence setup.</p>
          {feedback && <p role="status" className="text-sm text-ink">{feedback}</p>}
        </div>
      </SectionCard>
      <SectionCard title="Connected numbers" description="Each branch uses its own linked WhatsApp number. Select a branch before connecting.">
        {loading && <p className="text-sm text-muted">Loading connected numbers…</p>}
        {!loading && !connections.length && <p className="text-sm text-muted">No WhatsApp number linked to this branch yet.</p>}
        <div className="flex flex-col gap-4">
          {connections.map(connection => (
            <div key={connection._id} className="rounded-card border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{connection.phoneNumberDisplay}</p>
                  <p className="text-xs text-muted">Status: {connection.status.replaceAll('_', ' ')}</p>
                </div>
                {connection.status !== 'disconnected' && (
                  <Button variant="outline" disabled={busy} onClick={() => void disconnect(connection._id)}>Disconnect</Button>
                )}
              </div>
              {connection.status === 'number_pending' && (
                <div className="mt-3 flex flex-col gap-2">
                  <label className="text-sm font-medium text-ink" htmlFor={`meta-pin-${connection._id}`}>Six-digit WhatsApp registration PIN</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input id={`meta-pin-${connection._id}`} className="rounded-control border border-border bg-surface px-3 py-2 text-ink" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
                    <Button disabled={registering !== null || !/^\d{6}$/.test(pin)} onClick={() => void register(connection._id)}>Register number</Button>
                  </div>
                  <p className="text-xs text-muted">Choose and retain a six-digit PIN; Meta requires it for registration and future verification. Do not share it with Restora support.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
