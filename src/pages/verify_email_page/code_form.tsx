import { useNavigate } from 'react-router';
import authApi from '../../config/auth_api';
import AuthForm from '../../components/auth_form';
import useAuthStore from '../../store/auth_store';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import verifyEmailSchema from './schema';

interface CodeFormProps {
  email: string;
  /** Where to go once confirmed. */
  next: string;
}

/** Confirms the email with the emailed code. The answer signs them in and carries /me. */
export default function CodeForm({ email, next }: CodeFormProps) {
  const navigate = useNavigate();

  return (
    <AuthForm
      schema={verifyEmailSchema}
      submitLabel="Confirm email"
      busyLabel="Checking…"
      onSubmit={({ data, onSuccess, onError }) =>
        authApi
          .post('/email-otp/verify-email', { email, otp: data.code })
          .then((res) => {
            useAuthStore.getState().setMe(res.data.me);
            onSuccess('');
            navigate(next, { replace: true });
          })
          .catch(onError)
      }
      fields={({ register, errors }) => (
        <Input label="Code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123456" required autoFocus {...register('code')} error={fieldError(errors, 'code')} />
      )}
    />
  );
}
