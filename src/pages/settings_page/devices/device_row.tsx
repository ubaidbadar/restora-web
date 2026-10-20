import { Pencil, Trash2 } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import type Device from '../../../types/device';
import AlertModal from '../../../ui/alert_modal/modal';
import Badge from '../../../ui/badge';
import IconButton from '../../../ui/icon_button';
import formatAgo from '../../../utils/format_ago';
import toast from '../../../utils/toast';
import BranchName from './branch_name';
import DeviceFields from './device_fields';
import deviceSchema from './device_schema';
import getAxiosMessage from '../../../utils/get_axios_message';

interface DeviceRowProps {
  device: Device;
  onSaved: (device: Device) => void;
  onRemoved: (id: string) => void;
}

export default function DeviceRow({ device, onSaved, onRemoved }: DeviceRowProps) {
  return (
    <li className="flex min-h-14 items-center justify-between gap-2 py-2 ps-5 pe-3 sm:ps-6 sm:pe-4">
      <span className="min-w-0">
        <span className="flex items-center gap-2">
          <bdi className="truncate font-medium text-ink">{device.name}</bdi>
          {device.current && <Badge variant="success">This browser</Badge>}
        </span>
        <span className="block truncate text-sm text-muted">
          <BranchName id={device.branchId} /> · locks after {device.settings.idleLockSeconds}s{device.settings.lockAfterOrder ? ' and every order' : ''}
          {device.lastSeenAt && ` · used ${formatAgo(device.lastSeenAt).toLowerCase()}`}
        </span>
      </span>
      <span className="flex shrink-0">
        <FormDrawer
          title={`Edit ${device.name}`}
          schema={deviceSchema}
          defaultValues={{ name: device.name, idleLockSeconds: device.settings.idleLockSeconds, lockAfterOrder: device.settings.lockAfterOrder }}
          onSave={(values) =>
            api
              .patch(`/devices/${device._id}`, values)
              .then((res) => {
                onSaved(res.data);
                toast.success('Terminal saved');
              })
          }
          fields={(form) => <DeviceFields {...form} />}
          component={({ open }) => <IconButton icon={Pencil} size="lg" aria-label={`Edit ${device.name}`} onClick={open} />}
        />
        <AlertModal
          title={`Remove ${device.name}?`}
          description="Whoever is working on it is locked out at once, and it can't be unlocked again. Register it again to use it."
          confirmText="Remove"
          onConfirm={() =>
            api
              .delete(`/devices/${device._id}`)
              .then(() => {
                onRemoved(device._id);
                toast.success(`${device.name} removed`);
              }).catch((err) => toast.error(getAxiosMessage(err)))
          }
          component={({ open }) => <IconButton icon={Trash2} size="lg" className="hover:bg-danger-50 hover:text-danger-700" aria-label={`Remove ${device.name}`} onClick={open} />}
        />
      </span>
    </li>
  );
}
