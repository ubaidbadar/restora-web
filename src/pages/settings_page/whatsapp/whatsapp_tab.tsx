import { useState } from 'react';
import { z } from 'zod';
import { Link } from 'react-router';
import { MessageSquareText } from 'lucide-react';
import api from '../../../config/api';
import SectionCard from '../../../components/section_card';
import WhatsAppPushControls from '../../../components/whatsapp_push_controls';
import SkeletonList from '../../../components/skeleton_list';
import LoadFailed from '../../../components/load_failed';
import useGet from '../../../hooks/useGet';
import useWorkplace from '../../../hooks/useWorkplace';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import Toggle from '../../../ui/toggle';
import Form from '../../../ui/form';
import ConfirmModal from '../../../ui/confirm_modal/modal';
import toast from '../../../utils/toast';
import getAxiosMessage from '../../../utils/get_axios_message';
import WhatsAppSignupButton from '../../../components/whatsapp_signup_button';

type Connection = {
  _id: string; phoneNumberId: string; phoneNumberDisplay: string;
  status: 'connected' | 'disconnected' | 'token_expired' | 'number_pending';
  invoiceOnComplete?: boolean;
  isPlatformNumber?: boolean;
};
type SignupResult = { id: string; phoneNumberId: string; phoneNumberDisplay: string; status: Connection['status'] };
type SignupConfig = { enabled: boolean; appId: string | null; configId: string | null };

function BranchGuard({ config, hasConnection, onConnected }: {
  config: SignupConfig; hasConnection: boolean; onConnected: (result: SignupResult) => void;
}) {
  const workplace = useWorkplace();
  if (!workplace?.branch?._id) return (
    <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
      Select a restaurant branch before connecting WhatsApp.
    </p>
  );
  return <WhatsAppSignupButton appId={config.appId!} configId={config.configId!} branchId={workplace.branch._id}
    hasConnection={hasConnection} onConnected={onConnected}/>;
}

function SignupSection({ connections, onConnected }: { connections: Connection[]; onConnected: (result: SignupResult) => void }) {
  const { data, loading, error, get } = useGet<SignupConfig>('/whatsapp/signup/config');
  return (
    <SectionCard title="Connect your restaurant's WhatsApp"
      description="Receive customer messages and send order updates from your own WhatsApp Business number.">
      {loading && !data && <SkeletonList rows={3} variant="lines" />}
      {error && !data && <LoadFailed what="WhatsApp signup settings" onRetry={() => get()} />}
      {data && !data.enabled && <p role="alert" className="rounded-control bg-warning-50 p-3 text-sm text-warning-800">
        WhatsApp connection setup is not available right now. Please contact Restora support.
      </p>}
      {data?.enabled && data.appId && data.configId &&
        <BranchGuard config={data} hasConnection={connections.length > 0} onConnected={onConnected} />}
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
            onSuccess('Number registered successfully.');
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

function InvoicePreference({ connection, onSaved }: { connection: Connection; onSaved: (enabled: boolean) => void }) {
  const [saving, setSaving] = useState(false);
  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Toggle
          label="Send an invoice when a WhatsApp order is completed"
          checked={Boolean(connection.invoiceOnComplete)}
          disabled={saving}
          onChange={event => {
          const enabled = event.target.checked;
          setSaving(true);
          api.patch(`/whatsapp/connections/${connection._id}`, { invoiceOnComplete: enabled })
            .then(() => {
              onSaved(enabled);
              toast.success('Invoice preference saved');
            })
            .catch(error => toast.error(getAxiosMessage(error)))
            .finally(() => setSaving(false));
          }}
        />
        <span className="text-xs font-medium text-muted">
          Automatic invoices: {connection.invoiceOnComplete ? 'On' : 'Off'}
        </span>
      </div>
      <p className="text-xs text-muted">
        For orders placed through this number. Restora sends the invoice to the customer who placed the order when staff mark it completed, while the 24-hour WhatsApp service window is open.
      </p>
    </div>
  );
}

export default function WhatsAppTab() {
  const { data: connections = [], loading, error, get, update } = useGet<Connection[]>('/whatsapp/connections');
  const workplace = useWorkplace();
  const restaurantConnections = connections.filter(connection => !connection.isPlatformNumber);
  const activeConnections = restaurantConnections.filter(connection => connection.status === 'connected');
  const otherConnections = connections.filter(connection =>
    connection.isPlatformNumber ? connection.status !== 'disconnected' : connection.status !== 'connected');

  return (
    <div className="flex flex-col gap-5">
      {loading && !connections.length && <SkeletonList rows={2} variant="lines" />}
      {error && !connections.length && <LoadFailed what="WhatsApp connections" onRetry={() => get()} />}
      {!loading && !error && (
        <>
          {activeConnections.length > 0 ? (
            <SectionCard title="WhatsApp connected"
              description="Customer messages now arrive in your WhatsApp inbox.">
              <div className="flex flex-col gap-4">
                {activeConnections.map(connection => (
                  <div key={connection._id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border p-4">
                    <div>
                      <p className="font-semibold text-ink">{connection.phoneNumberDisplay}</p>
                      <p className="mt-1 text-sm text-muted">Branch: {workplace?.branch?.name ?? 'Selected branch'}</p>
                    </div>
                    <span className="rounded-pill bg-success-50 px-3 py-1 text-sm font-semibold text-success-700">
                      Connected
                    </span>
                    <div className="w-full flex flex-wrap gap-3">
                      <Button as="a"
                        href={`https://wa.me/${connection.phoneNumberDisplay.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer" variant="outline">
                        Send test message
                      </Button>
                      <InvoicePreference connection={connection} onSaved={enabled =>
                        update(rows => rows?.map(row => row._id === connection._id
                          ? { ...row, invoiceOnComplete: enabled } : row))} />
                    </div>
                  </div>
                ))}
                <div className="flex flex-wrap gap-3">
                  <Button as={Link} to="/whatsapp" icon={MessageSquareText}>Open WhatsApp inbox</Button>
                  {activeConnections.map(connection => (
                    <ConfirmModal key={connection._id}
                      title="Disconnect WhatsApp?"
                      description="Future WhatsApp replies and ordering will stop until you reconnect this number."
                      confirmText="Disconnect"
                      confirmVariant="danger"
                      onConfirm={() => api.post('/whatsapp/connections/' + connection._id + '/disconnect')
                        .then(() => {
                          update(rows => rows?.map(row => row._id === connection._id
                            ? { ...row, status: 'disconnected' } : row));
                          toast.success('WhatsApp disconnected from Restora');
                        }).catch(err => toast.error(getAxiosMessage(err)))}
                      component={({ open }) => <Button variant="outline" onClick={open}>
                        Disconnect {activeConnections.length > 1 ? connection.phoneNumberDisplay : ''}
                      </Button>}
                    />
                  ))}
                </div>
              </div>
            </SectionCard>
          ) : <SignupSection connections={restaurantConnections} onConnected={result =>
            update(current => {
              const connection: Connection = { _id: result.id, phoneNumberId: result.phoneNumberId,
                phoneNumberDisplay: result.phoneNumberDisplay, status: result.status };
              const existing = current ?? [];
              return existing.some(row => row._id === connection._id)
                ? existing.map(row => row._id === connection._id ? { ...row, ...connection } : row)
                : [...existing, connection];
            })} />}
          {otherConnections.length > 0 && <SectionCard title="Other WhatsApp numbers">
            <div className="flex flex-col gap-3">
              {otherConnections.map(connection => (
                <div key={connection._id} className="rounded-card border border-border p-4">
                  <p className="font-semibold text-ink">{connection.phoneNumberDisplay}</p>
                  <p className="mt-1 text-sm text-warning-800">
                    {connection.isPlatformNumber ? 'Restora OTP number · Not for restaurant messages' :
                      connection.status === 'number_pending' ? 'Registration required' :
                        connection.status === 'token_expired' ? 'Reconnect required' : 'Disconnected'}
                  </p>
                  {connection.isPlatformNumber ? <p className="mt-2 text-sm text-muted">
                    This number is reserved for Restora login codes. It is not a restaurant messaging number.
                  </p> : connection.status === 'number_pending' ?
                    <PendingRegistration connection={connection} onRegistered={id =>
                      update(rows => rows?.map(row => row._id === id ? { ...row, status: 'connected' } : row))} /> :
                    <p className="mt-2 text-sm text-muted">Connect this restaurant number again through Meta.</p>}
                  {connection.isPlatformNumber && <ConfirmModal
                    title="Disconnect OTP number?"
                    description="Remove this OTP-only number from this restaurant. Restora's platform OTP setup remains unchanged."
                    confirmText="Disconnect OTP number"
                    confirmVariant="danger"
                    onConfirm={() => api.post('/whatsapp/connections/' + connection._id + '/disconnect')
                      .then(() => {
                        update(rows => rows?.map(row => row._id === connection._id
                          ? { ...row, status: 'disconnected' } : row));
                        toast.success('OTP number disconnected from this restaurant');
                      }).catch(err => toast.error(getAxiosMessage(err)))}
                    component={({ open }) => <Button variant="outline" className="mt-3" onClick={open}>
                      Disconnect OTP number
                    </Button>} />}
                </div>
              ))}
            </div>
          </SectionCard>}
          {activeConnections.length > 0 && <details className="hidden rounded-card border border-border bg-surface p-4">
            <summary className="cursor-pointer font-medium text-accent-text">Connect another WhatsApp number</summary>
            <div className="mt-4">
              <SignupSection connections={restaurantConnections} onConnected={result =>
                update(current => {
                  const connection: Connection = { _id: result.id, phoneNumberId: result.phoneNumberId,
                    phoneNumberDisplay: result.phoneNumberDisplay, status: result.status };
                  const existing = current ?? [];
                  return existing.some(row => row._id === connection._id)
                    ? existing.map(row => row._id === connection._id ? { ...row, ...connection } : row)
                    : [...existing, connection];
                })} />
            </div>
          </details>}
        </>
      )}
      <SectionCard title="New message alerts"
        description="Get notified when customers message you, even if this tab is closed.">
        <WhatsAppPushControls />
        <p className="mt-2 text-xs text-muted">
          This browser setting also controls alerts for new orders and table calls. Turn it on or off here.
        </p>
      </SectionCard>
    </div>
  );
}
