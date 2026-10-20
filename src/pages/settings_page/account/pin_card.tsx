import { KeyRound } from 'lucide-react';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import pinSchema from '../../../constants/pin_schema';
import api from '../../../config/api';
import Button from '../../../ui/button';
import Input from '../../../ui/input';
import fieldError from '../../../utils/field_error';
import useAuthStore from '../../../store/auth_store';
import useWorkplace from '../../../hooks/useWorkplace';
import toast from '../../../utils/toast';

/**
 * Your 4–6 digit PIN for this restaurant's POS terminals. Only you set it, from a recent sign-in; a manager can clear
 * it but never see or set it. It works only on registered terminals, never to sign in here.
 */
export default function PinCard() {
  const workplace = useWorkplace();
  if (!workplace) return null;
  const hasPin = workplace.hasPin;

  return (
    <SectionCard
      title="POS PIN"
      description={hasPin ? 'You have a PIN for this restaurant. Change it any time.' : 'Set a PIN to unlock this restaurant’s shared POS terminals with your name.'}
      footer={
        <FormDrawer
          title={hasPin ? 'Change your PIN' : 'Set your PIN'}
          schema={pinSchema}
          submitLabel="Save PIN"
          onSave={(values) =>
            api
              .post('/me/pin', values)
              .then(() => {
                useAuthStore.getState().setWorkplace({ hasPin: true });
                toast.success('PIN saved. Use it on this restaurant’s POS terminals.');
              })
          }
          fields={({ register, errors }) => (
            <Input label="New PIN (4 to 6 digits)" type="password" inputMode="numeric" autoComplete="off" maxLength={6} required autoFocus {...register('pin')} error={fieldError(errors, 'pin')} />
          )}
          component={({ open }) => <Button variant={hasPin ? 'outline' : 'primary'} icon={KeyRound} onClick={open}>{hasPin ? 'Change PIN' : 'Set PIN'}</Button>}
        />
      }
    >
      <p className="text-sm text-muted">For your safety this needs a sign-in from the last 10 minutes. If it asks, sign out and in again.</p>
    </SectionCard>
  );
}
