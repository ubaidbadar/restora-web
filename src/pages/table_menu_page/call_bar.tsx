import { BellRing, ReceiptText } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router';
import api from '../../config/api';
import Button from '../../ui/button';

type Call = 'waiter' | 'bill';

const ANSWERS: Record<Call, string> = { waiter: 'A waiter is on the way.', bill: 'Your bill is on the way.' };

/** "Call waiter" and "Ask for bill", fixed at the bottom. The answer replaces the buttons until the guest closes it. */
export default function CallBar() {
  const { code = '' } = useParams<{ code: string }>();
  const [call, setCall] = useState<{ sending?: Call; message?: string }>({});

  const send = (type: Call) => {
    setCall({ sending: type });
    api
      .post(`/public/t/${code}/call`, { kind: type })
      .then(() => setCall({ message: ANSWERS[type] }))
      .catch(() => setCall({ message: 'Could not reach the staff. Please wave to a waiter.' }));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg">
      <div className="mx-auto max-w-xl">
        {call.message ? (
          <div role="status" className="flex items-center justify-between gap-3">
            <p className="font-medium text-ink">{call.message}</p>
            <Button variant="ghost" onClick={() => setCall({})}>
              OK
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button size="lg" icon={BellRing} disabled={Boolean(call.sending)} onClick={() => send('waiter')}>
              {call.sending === 'waiter' ? 'Calling…' : 'Call waiter'}
            </Button>
            <Button size="lg" variant="outline" icon={ReceiptText} disabled={Boolean(call.sending)} onClick={() => send('bill')}>
              {call.sending === 'bill' ? 'Asking…' : 'Ask for bill'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
