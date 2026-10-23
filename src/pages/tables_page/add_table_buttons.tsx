import { MoreHorizontal, Plus, Printer, Rows3 } from 'lucide-react';
import { useNavigate } from 'react-router';
import api from '../../config/api';
import FormDrawer from '../../components/form_drawer';
import type Table from '../../types/table';
import Button from '../../ui/button';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';
import toast from '../../utils/toast';
import BatchFields from './batch_fields';
import batchSchema from './batch_schema';
import TableFields from './table_fields';
import tableSchema from './table_schema';

interface AddTableButtonsProps {
  /** The sections already used, offered while typing one. */
  sections: string[];
  hasTables: boolean;
  onAdded: (...tables: Table[]) => void;
}

/**
 * The header's actions for people who manage tables: Add table, and a menu with adding many at once and printing every
 * QR card. Two buttons, so they stay on one line beside the title on a phone.
 */
export default function AddTableButtons({ sections, hasTables, onAdded }: AddTableButtonsProps) {
  const navigate = useNavigate();
  return (
    <>
      <FormDrawer
        title="Add many tables"
        submitLabel="Add tables"
        busyLabel="Adding…"
        schema={batchSchema}
        defaultValues={{ prefix: 'T', from: '1', to: '10' }}
        onSave={({ prefix, from, to, section, seats }) => {
          const names = Array.from({ length: to - from + 1 }, (_, index) => `${prefix}${from + index}`);
          return api.post('/tables/batch', { names, section: section || undefined, seats }).then((res) => {
            onAdded(...res.data);
            toast.success(`${names.length} tables added`);
          });
        }}
        fields={(form) => <BatchFields {...form} sections={sections} />}
        component={({ open }) => (
          <DropdownMenu
            trigger={(isOpen) => <IconButton icon={MoreHorizontal} variant="outline" size="lg" aria-label="More table actions" aria-haspopup="menu" aria-expanded={isOpen} />}
            items={[
              { label: 'Add many tables', icon: Rows3, onClick: open },
              ...(hasTables ? [{ label: 'Print QR cards', icon: Printer, onClick: () => navigate('/print/tables') }] : []),
            ]}
          />
        )}
      />
      <FormDrawer
        title="Add table"
        submitLabel="Add table"
        busyLabel="Adding…"
        schema={tableSchema}
        onSave={(values) =>
          api.post('/tables', values).then((res) => {
            onAdded(res.data);
            toast.success(`Table ${values.name} added`);
          })
        }
        fields={(form) => <TableFields {...form} sections={sections} />}
        component={({ open }) => (
          <Button icon={Plus} onClick={open}>
            Add table
          </Button>
        )}
      />
    </>
  );
}
