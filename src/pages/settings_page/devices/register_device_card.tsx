import { MonitorSmartphone } from 'lucide-react';
import { useNavigate } from 'react-router';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import authApi from '../../../config/auth_api';
import Button from '../../../ui/button';
import useAuthStore from '../../../store/auth_store';
import useWorkplace from '../../../hooks/useWorkplace';
import toast from '../../../utils/toast';
import DeviceFields from './device_fields';
import deviceSchema from './device_schema';

/**
 * Turns this browser into a shared POS terminal for the branch being worked on, then signs you out of it:
 * the terminal keeps only its own key (an httpOnly cookie), and staff unlock it with their PIN.
 */
export default function RegisterDeviceCard() {
  const navigate = useNavigate();
  const branchName = useWorkplace()?.branch?.name ?? 'this branch';

  return (
    <SectionCard title="Use this device as a POS terminal" description={`For ${branchName}. Staff pick their name and type their PIN; every order is recorded under their name.`}>
      <FormDrawer
        title="Register this terminal"
        schema={deviceSchema}
        defaultValues={{ name: 'Counter 1', idleLockSeconds: 90, lockAfterOrder: false }}
        submitLabel="Register and sign me out"
        onSave={(values) =>
          api
            .post('/devices', values)
            // Your own sign-in must not stay on a shared terminal.
            .then(() => authApi.post('/sign-out'))
            .then(() => {
              // This browser is now a locked terminal: known without asking.
              useAuthStore.getState().setMe(null, true);
              toast.success(`${values.name} is ready. Staff can unlock it with their PIN.`);
              navigate('/pos', { replace: true });
            })
        }
        fields={(form) => <DeviceFields {...form} />}
        component={({ open }) => <Button icon={MonitorSmartphone} onClick={open}>Register this device</Button>}
      />
    </SectionCard>
  );
}
