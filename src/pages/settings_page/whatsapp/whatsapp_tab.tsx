import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Link } from 'react-router';
import { CheckCircle2, CircleHelp, MessageSquareText, ShieldCheck } from 'lucide-react';
import api from '../../../config/api';
import SectionCard from '../../../components/section_card';
import WhatsAppPushControls from '../../../components/whatsapp_push_controls';
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
import parseWhatsAppSignupMessage from '../../../utils/parse_whatsapp_signup_message';

type Connection = {
  _id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
};
type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string; status: Connection['status'] };
type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };

// Meta returns the selected WABA/phone IDs through WA_EMBEDDED_SIGNUP and the one-time code through FB.login.
const META_DIALOG_VERSION = 'v26.0';

type MetaLoginResponse = { authResponse?: { code?: string } | null };
type MetaSdk = {
  init: (options: { appId: string; autoLogAppEvents: boolean; xfbml: boolean; version: string }) => void;
  login: (
    callback: (response: MetaLoginResponse) => void,
    options: {
      config_id: string;
      auth_type: 'rerequest';
      response_type: 'code';
      override_default_response_type: true;
      extras: { setup: Record<string, never> };
    },
  ) => void;
};
declare global {
  interface Window {
    FB?: MetaSdk;
    fbAsyncInit?: () => void;
  }
}

let metaSdkPromise: Promise<MetaSdk> | undefined;
let metaSdkAppId: string | undefined;
function loadMetaSdk(appId: string): Promise<MetaSdk> {
  const initialize = (sdk: MetaSdk) => {
    if (metaSdkAppId !== appId) {
      sdk.init({ appId, autoLogAppEvents: true, xfbml: false, version: META_DIALOG_VERSION });
      metaSdkAppId = appId;
    }
    return sdk;
  };
  if (window.FB) return Promise.resolve(initialize(window.FB));
  const pending = (metaSdkPromise ??= new Promise<MetaSdk>((resolve, reject) => {
    window.fbAsyncInit = () => {
      if (window.FB) resolve(window.FB);
      else reject(new Error('Meta sign-in did not initialize.'));
    };
    const script = document.getElementById('facebook-jssdk') as HTMLScriptElement | null;
    if (script) {
      script.addEventListener('load', () => {
        if (window.FB) resolve(window.FB);
        else reject(new Error('Meta sign-in did not initialize.'));
      }, { once: true });
      script.addEventListener('error', () => reject(new Error('Meta sign-in could not be loaded.')), { once: true });
      return;
    }
    const added = document.createElement('script');
    added.id = 'facebook-jssdk';
    added.src = 'https://connect.facebook.net/en_US/sdk.js';
    added.async = true;
    added.defer = true;
    added.crossOrigin = 'anonymous';
    added.onerror = () => reject(new Error('Meta sign-in could not be loaded.'));
    document.head.appendChild(added);
  }).catch((error: unknown) => {
    metaSdkPromise = undefined;
    document.getElementById('facebook-jssdk')?.remove();
    throw error;
  }));
  return pending.then(initialize);
}

type SignupUiState = {
  ready: boolean;
  busy: boolean;
  message: string;
  signupBranchId?: string;
  code?: string;
  wabaId?: string;
  phoneNumberId?: string;
  submitting?: boolean;
};

function MetaSignupButton({ appId, configId, branchId, hasConnection, onConnected }: {
  appId: string; configId: string; branchId: string; hasConnection: boolean; onConnected: (result: SignupResult) => void;
}) {
  const [status, setStatus] = useState<SignupUiState>({ ready: false, busy: false, message: 'Loading Meta sign-in…' });

  useEffect(() => {
    let active = true;
    loadMetaSdk(appId).then(() => {
      if (active) setStatus(current => ({ ...current, ready: true, message: '' }));
    }).catch(() => {
      if (active) setStatus({ ready: false, busy: false,
        message: 'Meta sign-in could not be loaded. Check your connection and allow connect.facebook.net.' });
    });
    return () => { active = false; };
  }, [appId]);

  useEffect(() => {
    const onMetaMessage = (event: MessageEvent) => {
      if (!status.busy || status.signupBranchId !== branchId) return;
      const result = parseWhatsAppSignupMessage(event.origin, event.data);
      if (!result) return;
      if (result.event === 'finish') {
        setStatus(current => current.signupBranchId === branchId ? {
          ...current, wabaId: result.wabaId, phoneNumberId: result.phoneNumberId,
          message: 'Meta selected your WhatsApp number. Finishing the secure connection…',
        } : current);
      } else {
        setStatus({
          ready: true, busy: false,
          message: result.event === 'cancel' ? 'Meta signup was cancelled. You can try again.' :
            result.event === 'invalid' ? 'Meta did not return a valid WhatsApp account and phone number. Please try again.' :
              'Meta reported a signup error. Please try again or contact support.',
        });
      }
    };
    window.addEventListener('message', onMetaMessage);
    return () => window.removeEventListener('message', onMetaMessage);
  }, [status.busy, status.signupBranchId, branchId]);

  useEffect(() => {
    if (status.busy && status.signupBranchId && status.signupBranchId !== branchId) {
      setStatus({ ready: true, busy: false,
        message: 'The selected branch changed during Meta authorization. Please start again from the intended branch.' });
      return;
    }
    if (!status.code || !status.wabaId || !status.phoneNumberId || status.submitting) return;
    setStatus(current => ({ ...current, submitting: true, message: 'Verifying and saving your restaurant number…' }));
    api.post<SignupResult>('/whatsapp/signup/complete', {
      code: status.code, wabaId: status.wabaId, phoneNumberId: status.phoneNumberId,
    }).then(({ data }) => {
      onConnected(data);
      setStatus({ ready: true, busy: false,
        message: data.status === 'connected' ? 'WhatsApp connected successfully.' : 'Meta authorized the number. Register it with a PIN below.' });
      toast.success('WhatsApp authorization saved');
    }).catch(err => {
      setStatus({ ready: true, busy: false, message: getAxiosMessage(err) });
      toast.error(getAxiosMessage(err));
    });
  }, [status.code, status.wabaId, status.phoneNumberId, status.submitting, status.signupBranchId, branchId, onConnected]);

  const connect = () => {
    if (!window.FB || !status.ready || status.busy) return;
    setStatus({ ready: true, busy: true, message: 'Opening Meta…', signupBranchId: branchId });
    try {
      window.FB.login((response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setStatus(current => current.signupBranchId === branchId
            ? { ready: true, busy: false, message: 'Meta did not return an authorization code. Please try again.' }
            : current);
          return;
        }
        setStatus(current => current.signupBranchId === branchId
          ? { ...current, code, message: 'Waiting for Meta to confirm the selected WhatsApp number…' }
          : current);
      }, {
        config_id: configId,
        auth_type: 'rerequest',
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {} },
      });
    } catch {
      setStatus({ ready: true, busy: false, message: 'Meta could not open the signup dialog. Please try again.' });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div><Button onClick={connect} disabled={!status.ready || status.busy}>
        {!status.ready ? 'Loading Meta…' : status.busy ? 'Connecting to Meta…' : hasConnection ? 'Connect another number' : 'Connect WhatsApp Business'}
      </Button></div>
      {status.message && <p role="status" className="text-sm text-muted">{status.message}</p>}
      {status.busy && !status.submitting && <Button variant="primaryLink" size="sm"
        onClick={() => setStatus({ ready: true, busy: false, message: 'Signup attempt cancelled. You can try again.' })}>
        Cancel attempt
      </Button>}
    </div>
  );
}

function BranchGuard({ config, hasConnection, onConnected }: {
  config: SignupConfig; hasConnection: boolean; onConnected: (result: SignupResult) => void;
}) {
  const workplace = useWorkplace();
  if (!workplace?.branch?._id) return (
    <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
      Select a restaurant branch before connecting WhatsApp.
    </p>
  );
  return <MetaSignupButton appId={config.appId!} configId={config.configId!} branchId={workplace.branch._id}
    hasConnection={hasConnection} onConnected={onConnected}/>;
}

function SignupSection({ connections, onConnected }: { connections: Connection[]; onConnected: (result: SignupResult) => void }) {
  const { data, loading, error, get } = useGet<SignupConfig>('/whatsapp/signup/config');
  return (
    <SectionCard title="WhatsApp Business"
      description="Connect your restaurant's own WhatsApp Business number through Meta.">
      {loading && !data && <SkeletonList rows={1} variant="lines"/>}
      {error && !data && <LoadFailed what="WhatsApp signup settings" onRetry={() => get()}/>}
      {data && !data.enabled && <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
        Meta Embedded Signup is not configured on the Restora backend. Contact support.
      </p>}
      <div className="mb-4 grid gap-3 text-sm text-ink sm:grid-cols-3">
        <div className="rounded-control bg-canvas p-3"><strong className="block">1. Authorize</strong>
          Choose your WhatsApp Business number in Meta.</div>
        <div className="rounded-control bg-canvas p-3"><strong className="block">2. Verify</strong>
          Restora securely verifies and saves the number.</div>
        <div className="rounded-control bg-canvas p-3"><strong className="block">3. Start messaging</strong>
          Register with a PIN if needed, then use your inbox.</div>
      </div>
      {connections.some(row => row.status === 'connected') &&
        <p role="status" className="mb-3 flex items-center gap-2 text-sm text-accent-text">
          <CheckCircle2 size={18} /> WhatsApp is connected. You can add another number for this branch.
        </p>}
      {data?.enabled && data.appId && data.configId &&
        <BranchGuard config={data} hasConnection={connections.some(row => row.status === 'connected')} onConnected={onConnected}/>}
      <p className="mt-3 flex items-start gap-2 text-xs text-muted"><ShieldCheck size={16} className="shrink-0" />
        Meta handles sign-in. Restora never receives your Facebook password; a connected phone only appears after verification succeeds.
      </p>
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
      <SignupSection connections={connections} onConnected={result =>
        update(current => {
          const connection: Connection = { _id: result.id, phoneNumberId: result.phoneNumberId,
            phoneNumberDisplay: result.phoneNumberDisplay, status: result.status };
          const existing = current ?? [];
          return existing.some(row => row._id === connection._id)
            ? existing.map(row => row._id === connection._id ? { ...row, ...connection } : row)
            : [...existing, connection];
        })}/>
      <SectionCard title="Connected numbers"
        description={`${connections.length} ${connections.length === 1 ? "number" : "numbers"} configured for your selected restaurant branch.`}>
        {loading && !connections.length && <SkeletonList rows={2} variant="lines"/>}
        {error && !connections.length && <LoadFailed what="WhatsApp connections" onRetry={() => get()}/>}
        {!loading && !error && !connections.length &&
          <div className="rounded-control bg-canvas p-4 text-sm text-muted">
            <CircleHelp size={20} className="mb-2" />
            <p className="font-semibold text-ink">No WhatsApp number connected yet</p>
            <p>Facebook Business Integrations showing Restora as active is only authorization.
              Finish the connection above before a number appears here.</p>
          </div>}
        <div className="flex flex-col gap-3">
          {connections.map(connection => (
            <div key={connection._id} className="rounded-card border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{connection.phoneNumberDisplay}</p>
                  <p className={`mt-1 text-xs font-medium ${connection.status === 'connected' ? 'text-accent-text' : 'text-muted'}`}>
                    {connection.status === 'connected' ? 'Connected · Ready for messages' :
                      connection.status === 'number_pending' ? 'Registration required' :
                      connection.status === 'token_expired' ? 'Reconnect required' : 'Disconnected'}
                  </p>
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
                <div className="mt-3 rounded-control bg-canvas p-3">
                  <p className="mb-2 text-sm font-semibold text-ink">Finish registering this number</p>
                  <PendingRegistration connection={connection} onRegistered={id =>
                    update(rows => rows?.map(row => row._id === id ? { ...row, status: 'connected' } : row))}/>
                </div>}
              {connection.status === 'token_expired' && <p className="mt-3 text-sm text-warning-800">
                Authorization expired. Reconnect this number through Meta above.</p>}
              {connection.status === 'disconnected' && <p className="mt-3 text-sm text-muted">
                Disconnected. Reconnect through Meta above to resume messages.</p>}
              {connection.status === 'connected' && <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <Button as={Link} to="/whatsapp" variant="outline" icon={MessageSquareText}>Open inbox</Button>
                <Button variant="outline" onClick={() => {
                  api.patch(`/whatsapp/connections/${connection._id}`, { invoiceOnComplete: !connection.invoiceOnComplete })
                    .then(() => {
                      update(rows => rows?.map(row => row._id === connection._id
                        ? { ...row, invoiceOnComplete: !connection.invoiceOnComplete } : row));
                      toast.success('Invoice preference saved');
                    }).catch(error => toast.error(getAxiosMessage(error)));
                }}>
                  {connection.invoiceOnComplete ? 'Completed-order invoices: On' : 'Completed-order invoices: Off'}
                </Button>
              </div>}
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="New message alerts"
        description="Get notified when customers message your restaurant, even if this tab is closed.">
        <WhatsAppPushControls />
        <p className="mt-2 text-xs text-muted">
          Browser permission also enables alerts for orders and table calls. Turning alerts off disables all Restora web push on this browser. Staff permissions and branch access still apply.
        </p>
      </SectionCard>
    </div>
  );
}
