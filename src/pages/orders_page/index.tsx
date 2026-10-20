import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import Can from '../../components/can';
import PageHeader from '../../components/page_header';
import Button from '../../ui/button';
import OrdersBoard from './orders_board';
import useWorkplace from '../../hooks/useWorkplace';

/** Today's orders of the working branch on a board: new, preparing, ready, out for delivery, done. */
export default function OrdersPage() {
  const branch = useWorkplace()?.branch;

  return (
    <>
      <PageHeader title="Orders" subtitle={`Today · ${branch?.name ?? 'No branch open'}`}>
        <Can permission="orders:create">
          <Button as={Link} to="/orders/new" icon={Plus}>New order</Button>
        </Can>
      </PageHeader>
      <OrdersBoard />
    </>
  );
}
