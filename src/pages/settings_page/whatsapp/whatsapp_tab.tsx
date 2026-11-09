import { useEffect, useState } from 'react';
import { z } from 'zod';
import api from '../../../config/api';
import SectionCard from '../../../components/section_card';
import SkeletonList from '../../../components/skeleton_list';
import LoadFailed from '../../../components/load_failed';
import useGet from '../../../hooks/useGet';
import useWorkplace from '../../../hooks/useWorkplace';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import Form from '../../../ui/form';
import ConfirmModal from '../../../ui/confirm_modal/modal';
import toast from '../../../utils/toast';
import getAxiosMessage from '../../../utils/get_axios_message';

type Connection = {
  _id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
};
type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string; status: Connection['status'] };
type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };
type MetaSDK = {
  init: (options: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
  login: (callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>) => void;
};
declare global { interface Window { FB?: MetaSDK; fbAsyncInit?: () => void } }

function MetaSignupButton({ appId, configId, onConnected }: {
  appId: string; configId: string; onConnected: (result: SignupResult) => void;
}) {
  const [status, setStatus] = useState({ ready: false, busy: false, message: '' });

  useEffect(() => {
    let mounted = true;
    const ready = () => {
      if (!mounted || !window.FB) return;
      window.FB.init({ appId, cookie: true, xfbml: false, version: 'v26.0' });
      setStatus({ ready: true, busy: false, message: '' });
    };
    if (window.FB) {
      Promise.resolve().then(ready);
    } else {
      window.fbAsyncInit = ready;
      if (!document.getElementById('meta-facebook-sdk')) {
        const script = document.createElement('script');
        script.id = 'meta-facebook-sdk';
        script.src = 'https://connect.facebook.net/en_US/sdk.js';
        script.async = true;
        script.crossOrigin = 'anonymous';
        script.onerror = () => {
          if (mounted) setStatus({ ready: false, busy: false, message: 'Could not load Meta. Check privacy settings and reload.' });
        };
        document.head.appendChild(script);
      }
    }
    return () => { mounted = false; };
  }, [appId]);

  const connect = () => {
    if (!window.FB || status.busy || !status.ready) return;
    let code = '';
    let wabaId = '';
    let phoneNumberId: string | undefined;
    let finished = false;
    let codeFallbackTimeout: number | undefined;
    setStatus({ ready: true, busy: true, message: 'Waiting for Meta authorization…' });

    const cleanUp = () => {
      window.clearTimeout(timeout);
      window.clearTimeout(codeFallbackTimeout);
      window.removeEventListener('message', onMessage);
    };
    const fail = (message: string) => {
      if (finished) return;
      finished = true;
      cleanUp();
      setStatus({ ready: true, busy: false, message });
    };
    const tryFinish = (allowCodeOnly = false) => {
      if (!code || (!wabaId && !allowCodeOnly) || finished) return;
      finished = true;
      cleanUp();
      setStatus({ ready: true, busy: true, message: 'Connecting your WhatsApp number…' });
      api.post<SignupResult>('/whatsapp/signup/complete', {
        code, ...(wabaId ? { wabaId } : {}), ...(phoneNumberId ? { phoneNumberId } : {}),
      }).then(({ data }) => {
        onConnected(data);
        setStatus({ ready: true, busy: false,
          message: data.status === 'connected' ? 'WhatsApp connected successfully.' : 'Meta authorized the number. Register it with a PIN below.' });
        toast.success('WhatsApp authorization saved');
      }).catch(err => {
        setStatus({ ready: true, busy: false, message: getAxiosMessage(err) });
        toast.error(getAxiosMessage(err));
      });
    };
    const onMessage = (event: MessageEvent) => {
      if (!['https://www.facebook.com', 'https://web.facebook.com', 'https://business.facebook.com'].includes(event.origin)) return;
      let value: unknown = event.data;
      if (typeof value === 'string') {
        try { value = JSON.parse(value); } catch { return; }
      }
      if (!value || typeof value !== 'object') return;
      const message = value as { type?: string; event?: string; data?: {
        waba_id?: string; waba_ids?: string[]; phone_number_id?: string; error_message?: string;
      } };
      if (message.type !== 'WA_EMBEDDED_SIGNUP') return;
      if (message.event === 'CANCEL' || message.event === 'ERROR') {
        fail(message.event === 'CANCEL' ? 'Meta signup was cancelled.' :
          message.data?.error_message || 'Meta signup failed. Please try again.');
        return;
      }
      if (!['FINISH', 'FINISH_ONLY_WABA', 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING',
        'FINISH_GRANT_ONLY_API_ACCESS', 'FINISH_OBO_MIGRATION'].includes(message.event || '')) return;
      if (!message.data?.waba_id && message.data?.waba_ids && message.data.waba_ids.length > 1) {
        fail('Meta returned multiple WhatsApp accounts. Select one account and retry.');
        return;
      }
      wabaId = message.data?.waba_id || message.data?.waba_ids?.[0] || wabaId;
      phoneNumberId = message.data?.phone_number_id || phoneNumberId;
      tryFinish();
    };
    const timeout = window.setTimeout(() => fail('Meta signup timed out. Please try again.'), 120000);
    window.addEventListener('message', onMessage);
    try {
      window.FB.login(response => {
        if (!response.authResponse?.code) {
          fail('Meta did not return an authorization code. Finish the Meta signup and try again.');
          return;
        }
        code = response.authResponse.code;
        if (wabaId) tryFinish();
        else {
          setStatus({ ready: true, busy: true, message: 'Verifying your Meta authorization…' });
          // Meta sends the account IDs separately from the short-lived code.
          // Give its session event a moment, then let the backend verify one authorized WABA.
          codeFallbackTimeout = window.setTimeout(() => tryFinish(true), 1200);
        }
      }, {
        config_id: configId,
        // Meta v4 recommends re-requesting permissions for users who already authorized Restora.
        auth_type: 'rerequest',
        response_type: 'code',
        override_default_response_type: true,
        extras: {},
      });
    } catch (error) {
      fail(error instanceof Error ? error.message : 'Meta signup could not open.');
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div><Button onClick={connect} disabled={!status.ready || status.busy}>
        {status.busy ? 'Connecting to Meta…' : status.ready ? 'Connect WhatsApp Business' : 'Loading Meta…'}
      </Button></div>
      {status.message && <p role="status" className="text-sm text-muted">{status.message}</p>}
    </div>
  );
}

function BranchGuard({ config, onConnected }: {
  config: SignupConfig; onConnected: (result: SignupResult) => void;
}) {
  const workplace = useWorkplace();
  if (!workplace?.branch?._id) return (
    <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
      Select a restaurant branch before connecting WhatsApp.
    </p>
  );
  return <MetaSignupButton appId={config.appId!} configId={config.configId!} onConnected={onConnected}/>;
}

function SignupSection({ onConnected }: { onConnected: (result: SignupResult) => void }) {
  const { data, loading, error, get } = useGet<SignupConfig>('/whatsapp/signup/config');
  return (
    <SectionCard title="WhatsApp Business"
      description="Connect your restaurant's own WhatsApp Business number through Meta.">
      {loading && !data && <SkeletonList rows={1} variant="lines"/>}
      {error && !data && <LoadFailed what="WhatsApp signup settings" onRetry={() => get()}/>}
      {data && !data.enabled && <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
        Meta Embedded Signup is not configured on the Restora backend. Contact support.
      </p>}
      {data?.enabled && data.appId && data.configId &&
        <BranchGuard config={data} onConnected={onConnected}/>}
      <p className="mt-3 text-xs text-muted">Sign in through your Facebook Business account. Restora does not receive your Facebook password.</p>
    </SectionCard>
  );
}

function PendingRegistration({ connection, onRegistered }: {
  connection: Connection; onRegistered: (id: string) => void;
}) {
  return (
    <Form schema={z.object({ pin: z.string().regex(/^\d{6}$/, 'Enter a six-digit PIN') })}
      defaultValues={{ pin: '' }}
      className="mt-3 flex flex-col gap-2"
      onSubmit={({ data, onSuccess, onError }) =>
        api.post(`/whatsapp/connections/${connection._id}/register`, { pin: data.pin })
          .then(() => {
            onRegistered(connection._id);
            onSuccess('Phone registered successfully.');
          }).catch(onError)
      }
      component={({ register, errors, loading, message, error }) => (
        <>
          <div className="flex flex-wrap items-end gap-2">
            <Input
              label="Six-digit WhatsApp registration PIN"
              type="password" inputMode="numeric" autoComplete="off" maxLength={6}
              error={errors.pin?.message?.toString()}
              {...register('pin')}
            />
            <Button type="submit" disabled={loading}>{loading ? 'Registering…' : 'Register number'}</Button>
          </div>
          {error && <p role="alert" className="text-sm text-danger-600">{error}</p>}
          {message && <p role="status" className="text-sm text-muted">{message}</p>}
          <p className="text-xs text-muted">Choose and retain the PIN for Meta verification. Do not share it with Restora support.</p>
        </>
      )}
    />
  );
}

export default function WhatsAppTab() {
  const { data: connections = [], loading, error, get, update } = useGet<Connection[]>('/whatsapp/connections');
  return (
    <div className="flex flex-col gap-5">
      <SignupSection onConnected={result =>
        update(current => {
          const connection: Connection = { _id: result.id, phoneNumberId: result.phoneNumberId,
            phoneNumberDisplay: result.phoneNumberDisplay, status: result.status };
          const existing = current ?? [];
          return existing.some(row => row._id === connection._id)
            ? existing.map(row => row._id === connection._id ? { ...row, ...connection } : row)
            : [...existing, connection];
        })}/>
      <SectionCard title="Connected numbers"
        description="WhatsApp connections for your selected restaurant branch.">
        {loading && !connections.length && <SkeletonList rows={2} variant="lines"/>}
        {error && !connections.length && <LoadFailed what="WhatsApp connections" onRetry={() => get()}/>}
        {!loading && !error && !connections.length && <p className="text-sm text-muted">No WhatsApp number connected yet.</p>}
        <div className="flex flex-col gap-3">
          {connections.map(connection => (
            <div key={connection._id} className="rounded-card border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{connection.phoneNumberDisplay}</p>
                  <p className="text-xs text-muted">Status: {connection.status.replaceAll('_', ' ')}</p>
                </div>
                {connection.status !== 'disconnected' &&
                  <ConfirmModal
                    title="Disconnect WhatsApp?"
                    description="Future WhatsApp replies and ordering will stop until you reconnect this number."
                    confirmText="Disconnect"
                    confirmVariant="danger"
                    onConfirm={() =>
                      api.post(`/whatsapp/connections/${connection._id}/disconnect`)
                        .then(() => {
                          update(rows => rows?.map(row => row._id === connection._id
                            ? { ...row, status: 'disconnected' } : row));
                          toast.success('WhatsApp disconnected from Restora');
                        }).catch(err => toast.error(getAxiosMessage(err)))
                    }
                    component={({ open }) => <Button variant="outline" onClick={open}>Disconnect</Button>}
                  />}
              </div>
              {connection.status === 'number_pending' &&
                <PendingRegistration connection={connection} onRegistered={id =>
                  update(rows => rows?.map(row => row._id === id ? { ...row, status: 'connected' } : row))}/>}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
