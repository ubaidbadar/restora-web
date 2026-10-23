import ChipRadios from '../../components/chip_radios';
import CANCEL_REASON_LABELS from '../../constants/cancel_reason_labels';
import type Order from '../../types/order';
import type OrderCancellation from '../../types/order_cancellation';
import type OverlayProps from '../../types/overlay_props';
import Button from '../../ui/button';
import FieldError from '../../ui/field_error';
import Form from '../../ui/form';
import Modal from '../../ui/modal';
import Textarea from '../../ui/textarea';
import cancelSchema from './cancel_schema';

interface CancelOrderPanelProps extends OverlayProps {
  order: Order;
  /** Sends the cancel with its reason; the server adds who and when. */
  onCancel: (body: Pick<OrderCancellation, 'reason' | 'note'>) => void;
}

const REASONS = Object.entries(CANCEL_REASON_LABELS).map(([value, label]) => ({ value, label }));

/** Asks why before cancelling an order (or turning down a guest's), so the cancelled list says what happened. */
export default function CancelOrderPanel({ order, onCancel, ...overlay }: CancelOrderPanelProps) {
  const pending = order.status === 'pending';

  return (
    <Modal {...overlay} title={pending ? `Turn down order #${order.dailyToken}?` : `Cancel order #${order.dailyToken}?`}>
      <Form
        schema={cancelSchema}
        className="flex flex-col gap-4"
        onSubmit={({ data }) => {
          onCancel({ reason: data.reason, note: data.note || undefined });
          overlay.close();
        }}
        component={({ register, errors }) => (
          <>
            <p className="text-sm text-body">
              {pending
                ? 'The guest’s order moves to Cancelled. Let them know at the table.'
                : "It moves to Cancelled and is not counted in sales. Its customer's khata and totals are corrected."}
            </p>
            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-ink">Why?</p>
              <ChipRadios register={register} name="reason" label="Why?" options={REASONS} defaultValue="" />
              <FieldError>{errors.reason?.message as string | undefined}</FieldError>
            </div>
            <Textarea label="Note" placeholder="Anything the team should know" maxLength={200} className="min-h-20" {...register('note')} error={errors.note?.message as string | undefined} />
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="ghost" onClick={overlay.close}>
                Keep it
              </Button>
              <Button type="submit" variant="danger">
                {pending ? 'Turn down' : 'Cancel order'}
              </Button>
            </div>
          </>
        )}
      />
    </Modal>
  );
}
