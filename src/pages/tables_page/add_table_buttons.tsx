import { Plus, Printer, Rows3 } from 'lucide-react';
import { Link } from 'react-router';
import api from '../../config/api';
import FormDrawer from '../../components/form_drawer';
import type Table from '../../types/table';
import Button from '../../ui/button';
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

/** The header's actions for people who manage tables: print every QR card, add many tables at once, add one. */
export default function AddTableButtons({ sections, hasTables, onAdded }: AddTableButtonsProps) {
  return (
    <>
      {hasTables && (
        <Button as={Link} to="/print/tables" variant="ghost" icon={Printer}>
          Print QR cards
        </Button>
      )}
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
          <Button variant="outline" icon={Rows3} onClick={open}>
            Add many
          </Button>
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
