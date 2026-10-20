import QrCode from '../../components/qr_code';
import type Table from '../../types/table';
import tableLink from '../../utils/table_link';
import useWorkplace from '../../hooks/useWorkplace';

/** One card per table: the restaurant, the table name, a big QR code and what scanning does. */
export default function TableCards({ tables }: { tables: Table[] }) {
  const restaurant = useWorkplace()?.restaurant ?? { name: 'Restaurant', logo: undefined };

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 px-4 pb-10 sm:grid-cols-2 print:max-w-none print:grid-cols-2 print:gap-0 print:p-0">
      {tables.map((table) => (
        <article key={table._id} className="flex break-inside-avoid flex-col items-center gap-3 rounded-card bg-surface p-6 text-center shadow-card print:h-[148mm] print:justify-center print:rounded-none print:border print:border-dashed print:border-border print:shadow-none">
          {restaurant.logo && <img src={restaurant.logo} alt="" className="h-12 w-auto object-contain" />}
          <p className="text-lg font-semibold">{restaurant.name}</p>
          <QrCode value={tableLink(table.qrCode)} label={`QR code of table ${table.name}`} className="size-52 print:size-[70mm]" />
          <p className="text-3xl font-bold tracking-tight">Table {table.name}</p>
          <p className="text-sm text-body">Scan for the menu and to call a waiter</p>
        </article>
      ))}
    </div>
  );
}
