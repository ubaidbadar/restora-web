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
import navigate from '../../../utils/navigate';

type Connection = {
  _id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
};
type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string; status: Connection['status'] };
type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };

// The full-page Meta authorization flow returns a short-lived one-time code to
// this exact redirect URI. The backend must use the same redirect when exchanging it.
const META_DIALOG_VERSION = 'v26.0';
const META_REDIRECT_URI = 'https://app.restora.live/settings/whatsapp';
const SIGNUP_STATE_KEY = 'restora:whatsapp-signup-state';
const SIGNUP_BRANCH_KEY = 'restora:whatsapp-signup-branch';

function randomState(): string {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

function MetaSignupButton({ appId, configId, branchId, hasConnection, onConnected }: {
  appId: string; configId: string; branchId: string; hasConnection: boolean; onConnected: (result: SignupResult) => void;
}) {
  const [status, setStatus] = useState({ ready: true, busy: false, message: '' });

  // Meta redirects back to this settings page with ?code=…&state=… after the
  // user finishes the Embedded Signup dialog. The code is one-use and lives
  // ~30s, so consume it as soon as the page boots. This button only mounts once
  // a branch is selected (BranchGuard), which the backend needs to complete
  // the signup. Meta returns no WABA/phone IDs in the redirect URL; the
  // backend resolves the authorized account from the code (debug_token).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (!code && !error) return;
    // Strip the one-use code (and any error) from the URL immediately so a
    // reload cannot replay it.
    const url = new URL(window.location.href);
    for (const key of ['code', 'state', 'error', 'error_description', 'error_reason']) url.searchParams.delete(key);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    if (error) {
      setStatus({ ready: true, busy: false,
        message: params.get('error_description') || 'Meta signup was cancelled.' });
      return;
    }
    const storedState = window.sessionStorage.getItem(SIGNUP_STATE_KEY);
    const storedBranch = window.sessionStorage.getItem(SIGNUP_BRANCH_KEY);
    window.sessionStorage.removeItem(SIGNUP_STATE_KEY);
    window.sessionStorage.removeItem(SIGNUP_BRANCH_KEY);
    if (!storedState || storedState !== params.get('state') || (storedBranch && storedBranch !== branchId)) {
      setStatus({ ready: true, busy: false,
        message: 'Meta authorization cannot be applied to a different restaurant branch. Select the original branch and try again.' });
      return;
    }
    setStatus({ ready: true, busy: true, message: 'Connecting your WhatsApp number…' });
    api.post<SignupResult>('/whatsapp/signup/complete', { code }).then(({ data }) => {
      onConnected(data);
      setStatus({ ready: true, busy: false,
        message: data.status === 'connected' ? 'WhatsApp connected successfully.' : 'Meta authorized the number. Register it with a PIN below.' });
      toast.success('WhatsApp authorization saved');
    }).catch(err => {
      setStatus({ ready: true, busy: false, message: getAxiosMessage(err) });
      toast.error(getAxiosMessage(err));
    });
  }, [onConnected]);

  const connect = () => {
    if (status.busy) return;
    setStatus({ ready: true, busy: true, message: 'Opening Meta…' });
    const state = randomState();
    window.sessionStorage.setItem(SIGNUP_STATE_KEY, state);
    window.sessionStorage.setItem(SIGNUP_BRANCH_KEY, branchId);
    const dialog = new URL(`https://www.facebook.com/${META_DIALOG_VERSION}/dialog/oauth`);
    dialog.searchParams.set('client_id', appId);
    dialog.searchParams.set('redirect_uri', META_REDIRECT_URI);
    dialog.searchParams.set('config_id', configId);
    dialog.searchParams.set('response_type', 'code');
    dialog.searchParams.set('override_default_response_type', 'true');
    dialog.searchParams.set('state', state);
    navigate(dialog.toString());
  };
  return (
    <div className="flex flex-col gap-2">
      <div><Button onClick={connect} disabled={status.busy}>
        {status.busy ? 'Connecting to Meta…' : hasConnection ? 'Connect another number' : 'Connect WhatsApp Business'}
      </Button></div>
      {status.message && <p role="status" className="text-sm text-muted">{status.message}</p>}
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
