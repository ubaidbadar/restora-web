import { Archive, Ellipsis, Pencil, QrCode as QrIcon } from 'lucide-react';
import api from '../../config/api';
import FormDrawer from '../../components/form_drawer';
import type Table from '../../types/table';
import AlertModal from '../../ui/alert_modal/modal';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';
import TableFields from './table_fields';
import TableQr from './table_qr';
import tableSchema from './table_schema';

interface TableManageProps {
  table: Table;
  sections: string[];
  onSaved: (table: Table) => void;
  /** Closes the table's sheet once the table is archived (it leaves the floor). */
  onArchived: () => void;
}

/**
 * The ⋯ menu in a table's sheet, for people who manage tables: edit it, its QR code, archive it. Kept in a menu so the
 * sheet itself stays about serving the table.
 */
export default function TableManage({ table, sections, onSaved, onArchived }: TableManageProps) {
  const archive = () =>
    api
      .post(`/tables/${table._id}/archive`)
      .then((res) => {
        onSaved(res.data);
        onArchived();
        toast.success(`${table.name} archived; its QR code no longer works`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <FormDrawer
      title={`Edit ${table.name}`}
      schema={tableSchema}
      defaultValues={{ name: table.name, section: table.section ?? '', seats: table.seats ? String(table.seats) : '' }}
      onSave={(values) => api.patch(`/tables/${table._id}`, values).then((res) => onSaved(res.data))}
      fields={(form) => <TableFields {...form} sections={sections} />}
      component={({ open: edit }) => (
        <TableQr
          table={table}
          onSaved={onSaved}
          component={({ open: showQr }) => (
            <AlertModal
              title={`Archive ${table.name}?`}
              description="Its QR code stops working and it leaves the floor. Past orders keep its name, and you can bring it back from Archived tables."
              confirmText="Archive"
              cancelText="Keep it"
              onConfirm={() => void archive()}
              component={({ open: confirmArchive }) => (
                <DropdownMenu
                  trigger={<IconButton icon={Ellipsis} aria-label={`Manage table ${table.name}`} aria-haspopup="menu" />}
                  items={[
                    { label: 'Edit table', icon: Pencil, onClick: edit },
                    { label: 'QR code', icon: QrIcon, onClick: showQr },
                    { label: 'Archive', icon: Archive, danger: true, onClick: confirmArchive },
                  ]}
                />
              )}
            />
          )}
        />
      )}
    />
  );
}
