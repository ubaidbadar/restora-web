import { Pencil } from 'lucide-react';
import FormDrawer from '../../../components/form_drawer';
import api from '../../../config/api';
import type MenuCategory from '../../../types/menu_category';
import type PrintAgent from '../../../types/print_agent';
import type Printer from '../../../types/printer';
import Badge from '../../../ui/badge';
import IconButton from '../../../ui/icon_button';
import toast from '../../../utils/toast';
import PrinterFields from './printer_fields';
import printerSchema from './printer_schema';

interface PrinterRowProps {
  agent: PrintAgent;
  printer: Printer;
  categories: MenuCategory[];
  onSaved: (agent: PrintAgent) => void;
}

/** What one printer prints is told in words: "Kitchen slips · Drinks, Juices · 80 mm". */
function summary(printer: Printer, categories: MenuCategory[]) {
  const names = categories.filter((category) => printer.categoryIds.includes(category._id)).map((category) => category.name);
  return [
    printer.prints.includes('kitchen') && `Kitchen slips${names.length ? ` (${names.join(', ')})` : ''}`,
    printer.prints.includes('receipt') && 'Receipts',
    !printer.prints.length && 'Not used yet',
    printer.width === 48 ? '80 mm' : '58 mm',
    printer.copies > 1 && `${printer.copies} copies`,
  ]
    .filter(Boolean)
    .join(' · ');
}

export default function PrinterRow({ agent, printer, categories, onSaved }: PrinterRowProps) {
  return (
    <li className="flex min-h-14 items-center justify-between gap-2 py-2 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <bdi className="truncate font-medium text-ink">{printer.label}</bdi>
          {!printer.present && <Badge variant="warning">Not found</Badge>}
        </span>
        <bdi className="block truncate text-sm text-muted">{printer.systemName}</bdi>
        <span className="block truncate text-sm text-muted">{summary(printer, categories)}</span>
      </span>
      <FormDrawer
        title={`Edit ${printer.label}`}
        schema={printerSchema}
        defaultValues={{ label: printer.label, prints: printer.prints, categoryIds: printer.categoryIds, width: String(printer.width), copies: printer.copies }}
        onSave={(values) =>
          api.patch(`/print-agents/${agent._id}/printers/${encodeURIComponent(printer.systemName)}`, values).then((res) => {
            onSaved(res.data);
            toast.success('Printer saved');
          })
        }
        fields={(form) => <PrinterFields categories={categories} {...form} />}
        component={({ open }) => <IconButton icon={Pencil} aria-label={`Edit ${printer.label}`} onClick={open} />}
      />
    </li>
  );
}
