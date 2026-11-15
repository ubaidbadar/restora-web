import api from '../config/api';
import type Order from '../types/order';
import useOutboxStore from '../store/outbox_store';
import queueOrderChange from './queue_order_change';
import getAxiosMessage from './get_axios_message';
import toast from './toast';
import syncOutbox from './sync_outbox';

interface ChangeOrderOptions {
  order: Pick<Order, '_id' | 'dailyToken' | 'pendingSync'>;
  method: 'post' | 'patch';
  url: string;
  body: unknown;
  done: string;
  onOrderUpdated?: (order: Order) => void;
}

/** Send an order change now, or put it on this device's outbox to sync in order when the connection returns. */
export default function changeOrder({ order, method, url, body, done, onOrderUpdated }: ChangeOrderOptions) {
  const queue = () => {
    queueOrderChange({ order, method, url, body });
    toast.success(`${done}. It will be sent when the internet is back.`);
  };

  if (order.pendingSync || !useOutboxStore.getState().online) return queue();

  api
    .request({ method, url, data: body })
    .then((res) => {
      onOrderUpdated?.(res.data);
      toast.success(done);
    })
    .catch((err) => {
      if (err.response) return toast.error(getAxiosMessage(err));
      queue();
      void syncOutbox();
    });
}
