import { useSearchParams } from 'react-router';
import { CheckCheck, Clock3, Inbox, MessageSquareText, RefreshCw, Send, Settings2 } from 'lucide-react';
import { Link } from 'react-router';
import { z } from 'zod';
import PageHeader from '../../components/page_header';
import LoadFailed from '../../components/load_failed';
import SkeletonList from '../../components/skeleton_list';
import useGet from '../../hooks/useGet';
import useCan from '../../hooks/useCan';
import api from '../../config/api';
import Button from '../../ui/button';
import Form from '../../ui/form';
import Textarea from '../../ui/textarea';

type Message = {
  _id: string; metaMessageId: string; phoneNumberId: string;
  phone: string; direction: 'inbound' | 'outbound'; text?: string;
  messageType: string; receivedAt: string; deliveryStatus?: string;
};
type Conversation = {
  phoneNumberId: string; phone: string; customerName: string | null;
  count: number; last: Message;
};
const replySchema = z.object({ text: z.string().trim().min(1, 'Write a message').max(4096) });

function ReplyForm({ thread, onSent }: { thread: Conversation; onSent: (message: Message) => void }) {
  const mayReply = useCan('orders:update');
  return (
    <Form
      key={thread.phoneNumberId + thread.phone}
      schema={replySchema}
      defaultValues={{ text: '' }}
      className="border-t border-border p-3"
      onSubmit={({ data, onReset, onSuccess, onError }) =>
        api.post<{ message?: Message; sent?: boolean; logged?: boolean }>(
          `/whatsapp/conversations/${encodeURIComponent(thread.phone)}/reply`,
          { phoneNumberId: thread.phoneNumberId, text: data.text },
        ).then(({ data: response, status }) => {
          if (status === 201 && response.message) onSent(response.message);
          onReset();
          onSuccess(status === 202 || response.logged === false
            ? 'WhatsApp accepted the reply, but Restora could not save it. Do not resend blindly.'
            : 'WhatsApp accepted your reply.');
        }).catch(onError)
      }
      component={({ register, errors, loading, message, error }) => (
        <>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Textarea
                label="Reply to customer"
                rows={2}
                maxLength={4096}
                disabled={!mayReply || loading}
                placeholder={mayReply ? 'Write a reply…' : 'You do not have permission to reply'}
                error={errors.text?.message?.toString()}
                {...register('text')}
              />
            </div>
            <Button type="submit" disabled={!mayReply || loading} icon={Send}>{loading ? 'Sending…' : 'Send'}</Button>
          </div>
          {error && <p role="alert" className="mt-2 text-sm text-danger-600">{error}</p>}
          {message && <p role="status" className="mt-2 text-sm text-muted">{message}</p>}
          <p className="mt-2 text-xs text-muted">Free-form replies are available for 24 hours after the customer's last message.</p>
        </>
      )}
    />
  );
}

function ConversationPanel({ thread, onSent }: { thread: Conversation; onSent: (message: Message) => void }) {
  const { data, loading, error, get, update } = useGet<{ messages: Message[] }>(
    `/whatsapp/conversations/${encodeURIComponent(thread.phone)}`,
    { params: { phoneNumberId: thread.phoneNumberId } },
  );
  const [params, setParams] = useSearchParams();
  const messages = data?.messages ?? [];
  return (
    <section aria-label="WhatsApp chat" className="flex min-w-0 flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="primaryLink" className="md:hidden" onClick={() => {
          const next = new URLSearchParams(params);
          next.delete('chat');
          setParams(next);
        }}>Back</Button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-heading text-ink">{thread.customerName || thread.phone}</h2>
          <p className="text-xs text-muted">{thread.phone}</p>
        </div>
        <Button icon={RefreshCw} variant="outline" size="sm" onClick={() => get()}>Refresh</Button>
      </header>
      <div className="flex min-h-[24rem] max-h-[65dvh] flex-1 flex-col gap-3 overflow-y-auto bg-canvas p-4">
        {loading && !data ? <SkeletonList rows={4} variant="lines" /> : null}
        {!loading && error && !data ? <LoadFailed what="this WhatsApp conversation" onRetry={() => get()}/> : null}
        {!loading && !error && messages.length === 0 ? <p className="text-sm text-muted">No messages in this conversation yet.</p> : null}
        {messages.map(message => (
          <div key={message._id || message.metaMessageId}
            className={`max-w-[85%] rounded-card p-3 text-sm shadow-card ${message.direction === 'outbound' ? 'ms-auto bg-primary-soft text-ink' : 'me-auto bg-surface text-ink'}`}>
            <p className="whitespace-pre-wrap break-words">{message.text || (message.messageType === 'image' ? 'Photo' : message.messageType === 'document' ? 'Document' : 'WhatsApp message')}</p>
            <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted">
              {new Date(message.receivedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              {message.direction === 'outbound' && (
                ['read', 'delivered'].includes(message.deliveryStatus || '')
                  ? <CheckCheck size={14} aria-label={message.deliveryStatus} />
                  : <Clock3 size={12} aria-label={message.deliveryStatus || 'sent'} />
              )}
              {message.deliveryStatus === 'failed' && <span className="text-danger-600">Failed</span>}
            </div>
          </div>
        ))}
      </div>
      <ReplyForm thread={thread} onSent={message => {
        update(previous => ({ messages: [...(previous?.messages ?? []), message] }));
        onSent(message);
      }} />
    </section>
  );
}

export default function WhatsAppPage() {
  const { data: conversations, loading, error, get, update } = useGet<Conversation[]>('/whatsapp/conversations');
  const [params, setParams] = useSearchParams();
  const selected = params.get('chat');
  const search = params.get('q') || '';
  const threads = conversations ?? [];
  const active = threads.find(thread => `${thread.phoneNumberId}:${thread.phone}` === selected);
  const visible = threads.filter(thread =>
    thread.phone.includes(search) || (thread.customerName || '').toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader title="WhatsApp inbox" subtitle="Messages sent to your restaurant's connected WhatsApp numbers." />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">Use Refresh to load new messages.</p>
        <div className="flex gap-2">
          <Button icon={RefreshCw} variant="outline" onClick={() => get()}>Refresh</Button>
          <Button as={Link} to="/settings/whatsapp" variant="outline" icon={Settings2}>Connections</Button>
        </div>
      </div>
      {error && !conversations && <LoadFailed what="WhatsApp conversations" onRetry={() => get()} />}
      <div className="grid min-h-[60dvh] overflow-hidden rounded-card bg-surface shadow-card md:grid-cols-[minmax(15rem,19rem)_minmax(0,1fr)]">
        <aside aria-label="WhatsApp conversations" className={`min-h-0 flex-col border-e border-border ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="border-b border-border p-4">
            <label htmlFor="whatsapp-search" className="text-sm font-semibold text-ink">Conversations</label>
            <input id="whatsapp-search" placeholder="Search name or phone"
              value={search} onChange={event => {
                const next = new URLSearchParams(params);
                if (event.target.value) next.set('q', event.target.value);
                else next.delete('q');
                setParams(next, { replace: true });
              }}
              className="mt-2 w-full rounded-control border border-border bg-canvas px-3 py-2 text-sm text-ink"/>
          </div>
          <div className="max-h-[65dvh] flex-1 overflow-y-auto">
            {loading && !conversations && <SkeletonList rows={5} variant="lines"/>}
            {!loading && conversations && !visible.length &&
              <div className="flex flex-col items-center gap-2 p-9 text-center text-sm text-muted">
                <Inbox size={26}/>No conversations found.
                <span className="text-xs">Connect a WhatsApp number in Settings and ask a test customer to message it.</span>
              </div>}
            {visible.map(thread => {
              const key = `${thread.phoneNumberId}:${thread.phone}`;
              return (
                <button type="button" key={key} aria-current={selected === key ? 'true' : undefined}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    next.set('chat', key);
                    setParams(next);
                  }}
                  className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-start hover:bg-canvas ${selected === key ? 'bg-primary-soft' : ''}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-accent-text">{(thread.customerName || thread.phone)[0]?.toUpperCase()}</span>
                  <span className="min-w-0 flex-1">
                    <strong className="block truncate text-sm text-ink">{thread.customerName || thread.phone}</strong>
                    {thread.customerName && <span className="block text-xs text-muted">{thread.phone}</span>}
                    <span className="mt-1 block truncate text-xs text-muted">{thread.last?.text || 'WhatsApp message'}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
        {active ? <ConversationPanel key={selected} thread={active} onSent={message => {
          update(current => current?.map(thread => thread.phoneNumberId === active.phoneNumberId &&
            thread.phone === active.phone ? { ...thread, last: message, count: thread.count + 1 } : thread));
        }} /> : (
          <div className={`min-w-0 place-items-center p-8 text-center ${selected ? 'hidden md:grid' : 'hidden md:grid'}`}>
            <div className="flex max-w-xs flex-col items-center gap-2 text-muted">
              <MessageSquareText size={34}/>
              <h2 className="text-heading text-ink">Select a conversation</h2>
              <p className="text-sm">Choose a customer to read messages and reply.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
