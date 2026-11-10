import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Bell, CheckCheck, Clock3, Inbox, MessageCircle, MessageSquareText, RefreshCw, Search, Send, Settings2 } from 'lucide-react';
import { z } from 'zod';
import PageHeader from '../../components/page_header';
import LoadFailed from '../../components/load_failed';
import SkeletonList from '../../components/skeleton_list';
import WhatsAppPushControls from '../../components/whatsapp_push_controls';
import useGet from '../../hooks/useGet';
import useCan from '../../hooks/useCan';
import api from '../../config/api';
import getCache from '../../store/get_cache';
import Button from '../../ui/button';
import Form from '../../ui/form';
import Textarea from '../../ui/textarea';
import WhatsAppLiveStatus from './live_status';

type Message = {
  _id: string; metaMessageId: string; phoneNumberId: string;
  phone: string; direction: 'inbound' | 'outbound'; text?: string;
  messageType: string; receivedAt: string; deliveryStatus?: string;
};
type Conversation = {
  phoneNumberId: string; phone: string; customerName: string | null;
  count: number; last: Message; lastInboundAt?: string | null; unread?: boolean; replyWindowOpen?: boolean;
};
const replySchema = z.object({ text: z.string().trim().min(1, 'Write a message').max(4096) });

function formatTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const today = new Date();
  return date.toDateString() === today.toDateString()
    ? date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ReplyForm({ thread, onSent }: { thread: Conversation; onSent: (message: Message) => void }) {
  const mayReply = useCan('orders:update');
  // Older API releases omit this flag. Let the API enforce the 24-hour
  // window until the new backend is deployed; never block every reply locally.
  const windowOpen = thread.replyWindowOpen !== false;
  const enabled = mayReply && windowOpen;
  return (
    <Form
      key={thread.phoneNumberId + thread.phone}
      schema={replySchema}
      defaultValues={{ text: '' }}
      className="border-t border-border bg-surface p-4"
      onSubmit={({ data, onReset, onSuccess, onError }) =>
        api.post<{ message?: Message; messageId?: string; sent?: boolean; logged?: boolean }>(
          `/whatsapp/conversations/${encodeURIComponent(thread.phone)}/reply`,
          { phoneNumberId: thread.phoneNumberId, text: data.text },
        ).then(({ data: response, status }) => {
          if (status === 201 && response.message) onSent(response.message);
          else if (status === 202 && response.sent && response.messageId) {
            onSent({
              _id: 'unlogged-' + response.messageId,
              metaMessageId: response.messageId,
              phoneNumberId: thread.phoneNumberId,
              phone: thread.phone,
              direction: 'outbound',
              text: data.text.trim(),
              messageType: 'text',
              receivedAt: new Date().toISOString(),
              deliveryStatus: 'sent',
            });
          }
          onReset();
          onSuccess(status === 202 || response.logged === false
            ? 'WhatsApp accepted the reply, but Restora could not save it. It is shown here temporarily; do not resend blindly.'
            : 'Reply sent.');
        }).catch(onError)
      }
      component={({ register, errors, loading, message, error }) => (
        <>
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Textarea label="Message" rows={2} maxLength={4096}
                disabled={!enabled || loading}
                placeholder={!mayReply ? 'Your role cannot reply to customers'
                  : !windowOpen ? 'Ask the customer to message again before replying'
                  : 'Write a message to the customer…'}
                error={errors.text?.message?.toString()} {...register('text')} />
            </div>
            <Button type="submit" icon={Send} disabled={!enabled || loading}>
              {loading ? 'Sending…' : 'Send'}
            </Button>
          </div>
          {!mayReply && <p className="mt-2 text-xs text-muted">Your role needs permission to update orders to send replies.</p>}
          {!windowOpen && <p role="status" className="mt-2 text-sm text-warning-800">
            Free-form messaging is closed. WhatsApp requires an approved template outside the 24-hour customer-service window.
            Ask the customer to message you to reopen it.
          </p>}
          {windowOpen && <p className="mt-2 text-xs text-muted">Replies are available for 24 hours after the customer's latest message.</p>}
          {error && <p role="alert" className="mt-2 text-sm text-danger-600">{error}</p>}
          {message && <p role="status" className="mt-2 text-sm text-muted">{message}</p>}
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
  const latestInboundId = [...messages].reverse().find(message => message.direction === 'inbound')?.metaMessageId;
  const latestMessageId = messages.at(-1)?.metaMessageId;

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) get();
    }, 12_000);
    const onFocus = () => { if (navigator.onLine) get(); };
    window.addEventListener('focus', onFocus);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', onFocus); };
  }, [get]);

  useEffect(() => {
    if (!latestInboundId) return;
    let active = true;
    api.post(`/whatsapp/conversations/${encodeURIComponent(thread.phone)}/read`, {
      phoneNumberId: thread.phoneNumberId, messageId: latestInboundId,
    }).then(() => {
      if (!active) return;
      getCache.update<Conversation[]>(getCache.keyOf('/whatsapp/conversations'), rows =>
        rows?.map(row => row.phoneNumberId === thread.phoneNumberId && row.phone === thread.phone
          ? { ...row, unread: false } : row));
    }).catch(() => {});
    return () => { active = false; };
  }, [thread.phoneNumberId, thread.phone, latestInboundId]);

  useEffect(() => {
    const container = document.getElementById('whatsapp-message-list');
    if (container) container.scrollTop = container.scrollHeight;
  }, [latestMessageId]);

  return (
    <section aria-label="WhatsApp chat" className="flex min-w-0 flex-col bg-surface">
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="primaryLink" className="md:hidden" onClick={() => {
          const next = new URLSearchParams(params);
          next.delete('chat');
          setParams(next);
        }}>Back</Button>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-accent-text">
          {(thread.customerName || thread.phone)[0]?.toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-heading text-ink">{thread.customerName || thread.phone}</h2>
          <p className="text-xs text-muted">{thread.phone} · {thread.count} messages</p>
        </div>
        <Button icon={RefreshCw} variant="outline" size="sm" onClick={() => get()}>Refresh</Button>
      </header>
      <div id="whatsapp-message-list" className="flex min-h-[22rem] max-h-[60dvh] flex-1 flex-col gap-3 overflow-y-auto bg-canvas p-4" aria-live="polite">
        {loading && !data && <SkeletonList rows={5} variant="lines" />}
        {!loading && error && !data && <LoadFailed what="this WhatsApp conversation" onRetry={() => get()} />}
        {!loading && !error && messages.length === 0 &&
          <div className="m-auto flex flex-col items-center gap-2 text-center text-muted">
            <MessageCircle size={30} />
            <p>No messages in this conversation yet.</p>
          </div>}
        {messages.map((message, index) => {
          const previous = messages[index - 1];
          const day = new Date(message.receivedAt).toDateString();
          const newDay = !previous || new Date(previous.receivedAt).toDateString() !== day;
          return (
            <div key={message._id || message.metaMessageId} className="flex flex-col gap-3">
              {newDay && <p className="text-center text-xs text-muted">
                {new Date(message.receivedAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>}
              <div className={`max-w-[88%] rounded-card border border-border p-3 text-sm shadow-card sm:max-w-[75%] ${message.direction === 'outbound'
                ? 'ms-auto bg-primary-soft text-ink' : 'me-auto bg-surface text-ink'}`}>
                <p className="whitespace-pre-wrap break-words">{message.text || (
                  message.messageType === 'image' ? 'Photo message' :
                  message.messageType === 'document' ? 'Document message' : 'WhatsApp message'
                )}</p>
                <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted">
                  {formatTime(message.receivedAt)}
                  {message.direction === 'outbound' &&
                    (['read', 'delivered'].includes(message.deliveryStatus || '')
                      ? <CheckCheck size={14} aria-label={message.deliveryStatus} />
                      : <Clock3 size={13} aria-label={message.deliveryStatus || 'sent'} />)}
                  {message.deliveryStatus === 'failed' && <span className="text-danger-600">Failed</span>}
                </div>
              </div>
            </div>
          );
        })}
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
  const search = (params.get('q') || '').trim().toLowerCase();
  const unreadOnly = params.get('filter') === 'unread';
  const threads = conversations ?? [];
  const unreadCount = threads.filter(thread => thread.unread).length;
  const active = threads.find(thread => `${thread.phoneNumberId}:${thread.phone}` === selected);
  const phoneDigits = search.replace(/\D/g, '');
  const localPhoneSearch = phoneDigits.startsWith('92') ? '0' + phoneDigits.slice(2) : phoneDigits;
  const visible = threads.filter(thread =>
    (!unreadOnly || thread.unread) &&
    (thread.phone.includes(search) ||
      (localPhoneSearch.length >= 4 && thread.phone.includes(localPhoneSearch)) ||
      (thread.customerName || '').toLowerCase().includes(search)));

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PageHeader title="WhatsApp inbox"
        subtitle={`${threads.length} conversations · ${unreadCount} unread`} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <WhatsAppLiveStatus />
          <Button variant="outline" icon={RefreshCw} onClick={() => get()}>Refresh</Button>
          <Button as={Link} to="/settings/whatsapp" variant="outline" icon={Settings2}>Connections</Button>
        </div>
        <WhatsAppPushControls />
      </div>
      {error && !conversations && <LoadFailed what="WhatsApp conversations" onRetry={() => get()} />}
      <div className="grid min-h-[65dvh] overflow-hidden rounded-card border border-border bg-surface shadow-card md:grid-cols-[minmax(15rem,20rem)_minmax(0,1fr)]">
        <aside aria-label="WhatsApp conversations" className={`min-h-0 flex-col border-e border-border ${selected ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex flex-col gap-3 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <MessageSquareText size={18} />
              <strong className="flex-1 text-sm text-ink">Conversations</strong>
              {unreadCount > 0 && <span aria-label={`${unreadCount} unread conversations`}
                className="rounded-chip bg-primary-soft px-2 py-0.5 text-xs font-semibold text-accent-text">{unreadCount} new</span>}
            </div>
            <label htmlFor="whatsapp-search" className="relative block">
              <span className="sr-only">Search by name or phone number</span>
              <Search size={16} aria-hidden="true" className="absolute start-3 top-1/2 -translate-y-1/2 text-muted" />
              <input id="whatsapp-search" placeholder="Search name or number"
                value={params.get('q') || ''} onChange={event => {
                  const next = new URLSearchParams(params);
                  if (event.target.value) next.set('q', event.target.value);
                  else next.delete('q');
                  setParams(next, { replace: true });
                }}
                className="w-full rounded-control border border-border bg-canvas py-2 pe-3 ps-9 text-sm text-ink" />
            </label>
            <div className="flex gap-2" aria-label="Conversation filter">
              {(['all', 'unread'] as const).map(filter => (
                <button type="button" key={filter} aria-pressed={(unreadOnly ? 'unread' : 'all') === filter}
                  onClick={() => {
                    const next = new URLSearchParams(params);
                    if (filter === 'unread') next.set('filter', 'unread');
                    else next.delete('filter');
                    setParams(next, { replace: true });
                  }}
                  className={`rounded-control px-3 py-1.5 text-xs font-semibold ${(unreadOnly ? 'unread' : 'all') === filter
                    ? 'bg-primary-soft text-accent-text' : 'bg-canvas text-muted hover:text-ink'}`}>
                  {filter === 'all' ? 'All chats' : 'Unread'}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[65dvh] flex-1 overflow-y-auto">
            {loading && !conversations && <div className="p-4"><SkeletonList rows={5} variant="lines" /></div>}
            {!loading && conversations && visible.length === 0 &&
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center text-sm text-muted">
                <Inbox size={30} />
                <p>{search ? 'No matching conversations.' : unreadOnly ? 'All conversations are read.' : 'No WhatsApp messages yet.'}</p>
                {!search && !unreadOnly && <Link className="text-accent-text underline" to="/settings/whatsapp">
                  Check your connected numbers
                </Link>}
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
                  className={`flex w-full items-start gap-3 border-b border-border px-3 py-3 text-start hover:bg-canvas ${selected === key ? 'bg-primary-soft' : ''}`}>
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-accent-text">
                    {(thread.customerName || thread.phone)[0]?.toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <strong className={`block flex-1 truncate text-sm ${thread.unread ? 'font-bold text-ink' : 'font-medium text-ink'}`}>
                        {thread.customerName || thread.phone}
                      </strong>
                      <time className="shrink-0 text-xs text-muted" dateTime={thread.last?.receivedAt}>
                        {thread.last?.receivedAt && formatTime(thread.last.receivedAt)}
                      </time>
                    </span>
                    {thread.customerName && <span className="block text-xs text-muted">{thread.phone}</span>}
                    <span className="mt-1 flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-xs text-muted">
                        {thread.last?.direction === 'outbound' ? 'You: ' : ''}
                        {thread.last?.text || 'WhatsApp message'}
                      </span>
                      {thread.unread && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                    </span>
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
          <div className="hidden min-w-0 place-items-center p-8 text-center md:grid">
            <div className="flex max-w-xs flex-col items-center gap-3 text-muted">
              <MessageCircle size={40} />
              <h2 className="text-heading text-ink">Your conversations, in one place</h2>
              <p>Choose a customer to read messages, check delivery status and reply during the open service window.</p>
              <span className="flex items-center gap-1 text-xs"><Bell size={14} /> Enable alerts to hear about new messages.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
