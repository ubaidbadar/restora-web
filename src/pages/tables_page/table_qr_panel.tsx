import { Download, Printer, RefreshCw } from 'lucide-react';
import QRCode from 'qrcode';
import { Link } from 'react-router';
import QrCode from '../../components/qr_code';
import type OverlayProps from '../../types/overlay_props';
import type Table from '../../types/table';
import AlertModal from '../../ui/alert_modal/modal';
import Button from '../../ui/button';
import Modal from '../../ui/modal';
import api from '../../config/api';
import getAxiosMessage from '../../utils/get_axios_message';
import tableLink from '../../utils/table_link';
import toast from '../../utils/toast';

interface TableQrPanelProps extends OverlayProps {
  table: Table;
  onSaved: (table: Table) => void;
}

/** Saves a QR code as a PNG file (1024 px, white border), e.g. to send to a printer. */
const downloadQrPng = async (value: string, fileName: string) => {
  const url = await QRCode.toDataURL(value, { errorCorrectionLevel: 'M', width: 1024, margin: 2 });
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
};

/** The table's QR code to print or download, and a way to replace it if a printed code was copied or lost. */
export default function TableQrPanel({ table, onSaved, ...overlay }: TableQrPanelProps) {
  const link = tableLink(table.qrCode);
  const replace = () => {
    api
      .post(`/tables/${table._id}/qr`)
      .then((res) => {
        onSaved(res.data);
        toast.success(`New QR code for ${table.name}. Print it again.`);
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <Modal {...overlay} title={`QR code · ${table.name}`}>
      <div className="flex flex-col items-center gap-4">
        <QrCode value={link} label={`QR code of ${table.name}`} className="size-60 rounded-small" />
        <p className="max-w-full truncate text-sm text-muted" title={link}>
          {link}
        </p>
        <div className="flex w-full flex-wrap justify-center gap-2">
          <Button icon={Download} onClick={() => void downloadQrPng(link, `qr-${table.name}.png`)}>
            Download PNG
          </Button>
          <Button as={Link} to={`/print/tables?ids=${table._id}`} variant="outline" icon={Printer}>
            Print card
          </Button>
          <AlertModal
            title={`Replace the QR code of ${table.name}?`}
            description="The printed code on this table stops working at once. Print the new one and put it on the table."
            confirmText="Replace code"
            cancelText="Keep it"
            onConfirm={replace}
            component={({ open }) => (
              <Button variant="ghost" icon={RefreshCw} onClick={open}>
                Replace code
              </Button>
            )}
          />
        </div>
      </div>
    </Modal>
  );
}
