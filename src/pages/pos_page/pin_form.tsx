import { useNavigate } from 'react-router';
import api from '../../config/api';
import AuthForm from '../../components/auth_form';
import type PosPerson from '../../types/pos_person';
import Input from '../../ui/input';
import useAuthStore from '../../store/auth_store';
import fieldError from '../../utils/field_error';
import unlockSchema from './unlock_schema';

interface PinFormProps {
  person: PosPerson;
}

/** The chosen person types their PIN; the terminal then works as them until it locks. */
export default function PinForm({ person }: PinFormProps) {
  const navigate = useNavigate();

  return (
    <AuthForm
      schema={unlockSchema}
      submitLabel={`Continue as ${person.name}`}
      onSubmit={({ data, onSuccess, onError }) => {
        api
          .post('/pos/unlock', {
            membershipId: person.membershipId,
            pin: data.pin,
          })
          .then((res) => {
            // The terminal now works as this person: the answer carries their /me.
            useAuthStore.getState().setMe(res.data.me);
            onSuccess('');
            navigate('/orders/new', { replace: true });
          })
          .catch(onError);
      }}
      fields={({ register, errors }) => (
        <Input
          label={`PIN for ${person.name}`}
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          placeholder="••••"
          autoFocus
          required
          className="text-center text-2xl tracking-[0.6em]"
          {...register('pin')}
          error={fieldError(errors, 'pin')}
        />
      )}
    />
  );
}
