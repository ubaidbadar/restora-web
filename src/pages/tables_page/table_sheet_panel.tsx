import { Plus } from 'lucide-react';
import { Link } from 'react-router';
import Can from '../../components/can';
import type FloorTable from '../../types/floor_table';
import type OverlayProps from '../../types/overlay_props';
import type Table from '../../types/table';
import Badge from '../../ui/badge';
import Button from '../../ui/button';
import Modal from '../../ui/modal';
import formatRs from '../../utils/format_rs';
import formatTime from '../../utils/format_time';
import minutesSince from '../../utils/minutes_since';
import TableManage from './table_manage';
import TableOrderRow from './table_order_row';
import tableStatus from './table_status';

interface TableSheetPanelProps extends OverlayProps {
  table: FloorTable;
  sections: string[];
  onAnswer: (requestId: string) => void;
  onSaved: (table: Table) => void;
}

/**
 * One table now: what it needs (as on its tile), calls to answer, its orders (each opens in full), what is left to
 * collect, the next booking, and one main action: a new order for it. Table settings sit in the ⋯ menu.
 */
export default function TableSheetPanel({ table, sections, onAnswer, onSaved, ...overlay }: TableSheetPanelProps) {
  const status = tableStatus(table);
  const toCollect = table.orders.filter((order) => order.paymentStatus === 'unpaid').reduce((sum, order) => sum + order.total, 0);

  return (
    <Modal {...overlay} title={`Table ${table.name}`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <p className="flex flex-wrap items-center gap-2">
              <Badge variant={status.tone}>{status.label}</Badge>
              {status.detail && <span className="text-sm tabular-nums text-body">{status.detail}</span>}
            </p>
            {(table.section || table.seats) && <p className="text-sm text-muted">{[table.section, table.seats && `${table.seats} seats`].filter(Boolean).join(' · ')}</p>}
          </div>
          <Can permission="tables:manage">
            <TableManage table={table} sections={sections} onSaved={onSaved} onArchived={overlay.close} />
          </Can>
        </div>

        {table.requests.map((request) => (
          <div key={request._id} className="flex items-center justify-between gap-3 rounded-control bg-warning-50 px-3 py-2">
            <p className="text-sm font-medium text-warning-800">
              {request.type === 'bill' ? 'Asked for the bill' : 'Called a waiter'} · {minutesSince(request.createdAt)} min ago
            </p>
            <Button size="sm" onClick={() => onAnswer(request._id)}>
              Done
            </Button>
          </div>
        ))}

        {table.orders.length > 0 && (
          <section aria-label="Orders at this table">
            <ul className="-mx-3 flex flex-col">
              {table.orders.map((order) => (
                <TableOrderRow key={order._id} order={order} />
              ))}
            </ul>
            {toCollect > 0 && (
              <p className="mt-2 flex justify-between border-t border-border pt-3 text-sm">
                <span className="text-muted">To collect</span>
                <span className="font-semibold tabular-nums text-ink">{formatRs(toCollect)}</span>
              </p>
            )}
          </section>
        )}

        {table.booking && (
          <p className="rounded-control bg-info-50 px-3 py-2 text-sm text-info-800">
            Booked for {formatTime(table.booking.dateTime)} · {table.booking.partySize} people
          </p>
        )}

        <Can permission="orders:create">
          <Button as={Link} to={`/orders/new?table=${table._id}`} size="lg" icon={Plus} className="w-full">
            New order for {table.name}
          </Button>
        </Can>
      </div>
    </Modal>
  );
}
