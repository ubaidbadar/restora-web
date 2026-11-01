import { useState } from 'react';
import type Order from '../types/order';
import Tabs from '../ui/tabs';
import OrderDetails from './order_details';
import OrderTimeline from './order_timeline';

/** An order in a drawer: what it is now, or everything that happened to it (History). */
export default function OrderView({ order }: { order: Order }) {
  const [tab, setTab] = useState<'details' | 'history'>('details');
  return (
    <div className="flex flex-col gap-5">
      <Tabs
        name="order-view"
        label="Show"
        options={[
          { value: 'details', label: 'Details' },
          { value: 'history', label: 'History' },
        ]}
        value={tab}
        onChange={setTab}
        fill
      />
      {tab === 'details' ? <OrderDetails order={order} /> : <OrderTimeline order={order} />}
    </div>
  );
}
