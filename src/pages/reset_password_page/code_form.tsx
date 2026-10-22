import { useNavigate } from 'react-router';
import authApi from '../../config/auth_api';
import AuthForm from '../../components/auth_form';
import Input from '../../ui/input';
import PasswordInput from '../../ui/password_input';
import fieldError from '../../utils/field_error';
import toast from '../../utils/toast';
import codeSchema from './code_schema';

/** The emailed code and the new password, then the person signs in. */
export default function CodeForm({ email }: { email: string }) {
  const navigate = useNavigate();

  return (
    <AuthForm
      schema={codeSchema}
      submitLabel="Save new password"
      onSubmit={({ data, onSuccess, onError }) =>
        authApi
          .post('/email-otp/reset-password', { email, otp: data.code, password: data.password })
          .then(() => {
            onSuccess('');
            toast.success('Password changed. Sign in with the new one.');
            navigate('/login', { replace: true });
          })
          .catch(onError)
      }
      fields={({ register, errors }) => (
        <>
          <Input label="Code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} placeholder="123456" required autoFocus {...register('code')} error={fieldError(errors, 'code')} />
          <PasswordInput label="New password" autoComplete="new-password" required placeholder="At least 8 characters" {...register('password')} error={fieldError(errors, 'password')} />
        </>
      )}
    />
  );
}
