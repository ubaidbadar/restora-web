import { useEffect, useRef, useState } from 'react';
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
import navigate from '../../../utils/navigate';

type Connection = {
  _id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
};
type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string; status: Connection['status'] };
type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };

// Manual redirect flow for Meta Embedded Signup (Meta's documented path).
// The JavaScript SDK popup (FB.login) can never work here: with "Use Strict Mode
// for Redirect URIs" on, Meta requires the code-exchange redirect_uri to be both
// identical to the dialog's and owned by the app, while the SDK dialog always
// uses Meta's own channel URL — no value satisfies both. The redirect flow sends
// the user to the dialog and back to this settings page with ?code=…&state=….
const META_DIALOG_VERSION = 'v26.0';
const META_REDIRECT_URI = 'https://app.restora.live/settings/whatsapp';
const SIGNUP_STATE_KEY = 'restora:whatsapp-signup-state';

// Restora's own platform number (+92 339 6262068).
// The Meta dialog is only the login handshake here: Embedded Signup onboarding
// (which would pick the account) is blocked until the app passes App Review,
// so for our own number we pass its known IDs and the backend validates the
// login token against that account directly. Other restaurants will use the
// picker once onboarding is approved.
// NOTE: META_MESSAGING_ACCOUNT_ID is the Messaging Account ID, NOT the
// WhatsApp Account (WABA) ID 2025669858106128. Under Meta's new account model
// the WABA was split in two: the WhatsApp Account holds the number, while
// the Messaging Account holds templates, billing and webhook subscriptions.
// The WABA ID rejects the phone-numbers list and subscribed_apps calls
// ("This API is not supported for this WhatsApp Business Account"); the
// Messaging Account ID accepts them.
const META_MESSAGING_ACCOUNT_ID = '1506044834668577';
const META_PHONE_NUMBER_ID = '1441060799087277';

function randomState(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

function MetaSignupButton({ appId, configId, onConnected }: {
  appId: string; configId: string; onConnected: (result: SignupResult) => void;
}) {
  const [status, setStatus] = useState({ ready: true, busy: false, message: '' });
  const consumedRef = useRef(false);

  // Meta redirects back to this settings page with ?code=…&state=… after the
  // user finishes the Meta login dialog. The code is one-use and lives
  // ~30s, so consume it as soon as the page boots. This button only mounts once
  // a branch is selected (BranchGuard), which the backend needs to complete
  // the signup. Meta returns no WABA/phone IDs in the redirect URL; we send
  // Restora's own known IDs with the code and the backend validates the login
  // token against that account directly.
  useEffect(() => {
    if (consumedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');
    if (!code && !error) return;
    consumedRef.current = true;
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
    window.sessionStorage.removeItem(SIGNUP_STATE_KEY);
    if (!storedState || storedState !== params.get('state')) {
      setStatus({ ready: true, busy: false, message: 'Meta signup could not be verified. Please try again.' });
      return;
    }
    setStatus({ ready: true, busy: true, message: 'Connecting your WhatsApp number…' });
    api.post<SignupResult>('/whatsapp/signup/complete', {
      code, wabaId: META_MESSAGING_ACCOUNT_ID, phoneNumberId: META_PHONE_NUMBER_ID,
    }).then(({ data }) => {
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
        {status.busy ? 'Connecting to Meta…' : 'Connect WhatsApp Business'}
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
