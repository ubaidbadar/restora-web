import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { CheckCheck, Clock3, Inbox, MessageSquareText, RefreshCw, Send, Settings2, WifiOff } from 'lucide-react';
import { Link } from 'react-router';
import api from '../../config/api';
import can from '@shared/can';
import useWorkplace from '../../hooks/useWorkplace';
import getAxiosMessage from '../../utils/get_axios_message';
import Button from '../../ui/button';
import PageHeader from '../../components/page_header';

type Message = {
  _id: string;
  metaMessageId: string;
  phoneNumberId: string;
  phone: string;
  from: string;
  direction: 'inbound' | 'outbound';
  text?: string;
  messageType: string;
  receivedAt: string;
  deliveryStatus?: string;
};
type Conversation = {
  phoneNumberId: string;
  phone: string;
  customerName: string | null;
  count: number;
  last: Message;
};
const summary = (message: Message) => message.text?.trim() || (message.messageType === 'image' ? 'Photo' : message.messageType === 'document' ? 'Document' : 'WhatsApp message');
const time = (value?: string) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};
const chatKey = (thread: Pick<Conversation, 'phone' | 'phoneNumberId'>) => `${thread.phoneNumberId}:${thread.phone}`;

/** Read and reply only through the authenticated tenant-scoped WhatsApp API. */
export default function WhatsAppPage() {
  const workplace = useWorkplace();
  const mayReply = can(workplace, 'orders:update');
  const [threads, setThreads] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [chatError, setChatError] = useState('');
  const [notice, setNotice] = useState('');
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selected;

  const refreshThreads = useCallback(async () => {
    try {
      const { data } = await api.get<Conversation[]>('/whatsapp/conversations');
      setThreads(data);
      setError('');
    } catch (e) { setError(getAxiosMessage(e)); }
    finally { setLoading(false); }
  }, []);

  const refreshChat = useCallback(async (thread: Conversation, silent = false) => {
    if (!silent) setChatLoading(true);
    try {
      const { data } = await api.get<{ messages: Message[] }>(
        `/whatsapp/conversations/${encodeURIComponent(thread.phone)}`,
        { params: { phoneNumberId: thread.phoneNumberId } });
      if (selectedRef.current === chatKey(thread)) {
        setMessages(data.messages);
        setChatError('');
      }
    } catch (e) {
      if (selectedRef.current === chatKey(thread)) setChatError(getAxiosMessage(e));
    } finally { if (!silent) setChatLoading(false); }
  }, []);

  useEffect(() => { void refreshThreads(); }, [refreshThreads]);
  const active = threads.find(t => chatKey(t) === selected) || null;
  useEffect(() => {
    if (!active) return;
    void refreshChat(active);
  }, [selected, active?.phone, active?.phoneNumberId, refreshChat]);
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      void refreshThreads();
      const thread = threads.find(t => chatKey(t) === selectedRef.current);
      if (thread) void refreshChat(thread, true);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [refreshThreads, refreshChat, threads]);
  useEffect(() => { lastMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages.length, selected]);

  const send = async (event: FormEvent) => {
    event.preventDefault();
    if (!active || !mayReply || sending || !draft.trim()) return;
    setSending(true); setChatError(''); setNotice('');
    const text = draft.trim();
    try {
      const { data, status } = await api.post(
        `/whatsapp/conversations/${encodeURIComponent(active.phone)}/reply`,
        { phoneNumberId: active.phoneNumberId, text });
      setDraft('');
      if (status === 202 || (data as { logged?: boolean }).logged === false) {
        setNotice('Meta accepted the reply, but Restora could not save the message in the inbox. Do not resend it blindly.');
      } else {
        setNotice('Reply accepted by WhatsApp.');
      }
      await Promise.all([refreshChat(active, true), refreshThreads()]);
    } catch (e) {
      setChatError(getAxiosMessage(e));
    } finally { setSending(false); }
  };

  const shown = threads.filter(t => {
    const q = query.toLowerCase();
    return (t.phone || '').includes(q) || (t.customerName || '').toLowerCase().includes(q);
  });
  return <div className="flex min-h-0 flex-1 flex-col gap-4">
    <PageHeader title="WhatsApp inbox" subtitle="Messages sent to your restaurant's connected WhatsApp numbers." />
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">Customer conversations are refreshed automatically while this page is open.</p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => { void refreshThreads(); if (active) void refreshChat(active); }} icon={RefreshCw}>Refresh</Button>
        <Button as={Link} to="/settings/whatsapp" variant="outline" icon={Settings2}>Connections</Button>
      </div>
    </div>
    {error && <p className="rounded-card bg-danger-50 p-3 text-sm text-danger-600" role="alert">{error}</p>}
    <div className="grid min-h-[60dvh] overflow-hidden rounded-card bg-surface shadow-card md:grid-cols-[minmax(15rem,19rem)_minmax(0,1fr)]">
      <aside className={`min-h-0 flex-col border-e border-border ${selected ? 'hidden md:flex' : 'flex'}`} aria-label="WhatsApp conversations">
        <div className="border-b border-border p-4">
          <label htmlFor="wa-search" className="text-sm font-semibold text-ink">Conversations</label>
          <input id="wa-search" placeholder="Search name or phone" value={query} onChange={e => setQuery(e.target.value)}
            className="mt-2 w-full rounded-control border border-border bg-canvas px-3 py-2 text-sm text-ink outline-offset-2" />
        </div>
        <div className="max-h-[65dvh] flex-1 overflow-y-auto">
          {loading && <p className="p-4 text-sm text-muted">Loading conversations…</p>}
          {!loading && !shown.length && <div className="flex flex-col items-center gap-2 p-9 text-center text-sm text-muted"><Inbox size={26} />No conversations found.<span className="text-xs">Connect your number in Settings, then ask a test customer to message it.</span></div>}
          {shown.map(thread => <button type="button" key={chatKey(thread)}
            onClick={() => { setSelected(chatKey(thread)); setMessages([]); setNotice(''); setChatError(''); }}
            aria-current={selected === chatKey(thread) ? 'true' : undefined}
            className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-start hover:bg-canvas ${selected === chatKey(thread) ? 'bg-primary-soft' : ''}`}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft font-semibold text-accent-text">{(thread.customerName || thread.phone || '?')[0]?.toUpperCase()}</span>
            <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2">
              <strong className="truncate text-sm text-ink">{thread.customerName || thread.phone}</strong>
              <span className="shrink-0 text-xs text-muted">{time(thread.last?.receivedAt)}</span></span>
              {thread.customerName && <span className="block text-xs text-muted">{thread.phone}</span>}
              <span className="mt-1 block truncate text-xs text-muted">{thread.last ? summary(thread.last) : 'No recent message'}</span>
            </span>
          </button>)}
        </div>
      </aside>
      <section className={`min-w-0 flex-col ${selected ? 'flex' : 'hidden md:flex'}`} aria-label="Selected WhatsApp chat">
        {!active ? <div className="grid flex-1 place-items-center p-8 text-center"><div className="flex max-w-xs flex-col items-center gap-2 text-muted"><MessageSquareText size={34}/><h2 className="font-semibold text-ink">Select a conversation</h2><p className="text-sm">Choose a customer to read messages and reply during WhatsApp's permitted messaging window.</p></div></div> : <>
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button type="button" className="rounded-control px-2 py-1 text-sm font-semibold text-accent-text md:hidden" onClick={() => setSelected(null)}>Back</button>
            <span className="grid size-10 place-items-center rounded-full bg-primary-soft font-semibold text-accent-text">{(active.customerName || active.phone)[0]?.toUpperCase()}</span>
            <div className="min-w-0"><h2 className="truncate text-sm font-semibold text-ink">{active.customerName || active.phone}</h2><p className="text-xs text-muted">{active.phone} · {active.phoneNumberId}</p></div>
          </header>
          <div className="flex min-h-[24rem] max-h-[65dvh] flex-1 flex-col gap-3 overflow-y-auto bg-canvas p-4">
            {chatLoading && <p className="text-center text-sm text-muted">Loading messages…</p>}
            {!chatLoading && !messages.length && <p className="text-center text-sm text-muted">No messages available yet.</p>}
            {messages.map(message => <div key={message._id || message.metaMessageId} className={`max-w-[85%] rounded-card p-3 text-sm shadow-card ${message.direction === 'outbound' ? 'ms-auto bg-primary-soft text-ink' : 'me-auto bg-surface text-ink'}`}>
              <p className="whitespace-pre-wrap break-words">{summary(message)}</p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-muted">
                {time(message.receivedAt)}
                {message.direction === 'outbound' && (message.deliveryStatus === 'read' || message.deliveryStatus === 'delivered'
                  ? <CheckCheck size={14} aria-label={message.deliveryStatus}/> : <Clock3 size={12} aria-label={message.deliveryStatus || 'sent'}/>)}
                {message.deliveryStatus === 'failed' && <span className="font-semibold text-danger-600">Failed</span>}
              </div>
            </div>)}
            <div ref={lastMessageRef}/>
          </div>
          {chatError && <div role="alert" className="flex items-center gap-2 border-t border-border bg-warning-50 px-4 py-2 text-xs text-warning-800"><WifiOff size={15} className="shrink-0"/>{chatError}</div>}
          {notice && <p role="status" className="border-t border-border px-4 py-2 text-xs text-muted">{notice}</p>}
          <form onSubmit={send} className="flex items-end gap-2 border-t border-border p-3">
            <label htmlFor="wa-reply" className="sr-only">Message to {active.phone}</label>
            <textarea id="wa-reply" rows={2} maxLength={4096} value={draft} disabled={!mayReply || sending}
              onChange={e => setDraft(e.target.value)} placeholder={mayReply ? 'Write a reply…' : 'You do not have reply permission'}
              className="max-h-32 min-w-0 flex-1 resize-y rounded-control border border-border bg-surface px-3 py-2 text-sm text-ink"/>
            <Button type="submit" disabled={!mayReply || sending || !draft.trim()} icon={Send}>{sending ? 'Sending…' : 'Send'}</Button>
          </form>
          <p className="px-4 pb-3 text-xs text-muted">Free-form replies are limited to 24 hours after the customer's last message. If closed, the server will reject the reply.</p>
        </>}
      </section>
    </div>
  </div>;
}
