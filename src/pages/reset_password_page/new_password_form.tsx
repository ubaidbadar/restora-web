import { useNavigate, useSearchParams } from 'react-router';
import authApi from '../../config/auth_api';
import AuthForm from '../../components/auth_form';
import PasswordInput from '../../ui/password_input';
import fieldError from '../../utils/field_error';
import toast from '../../utils/toast';
import newPasswordSchema from './new_password_schema';

/** Sets the new password, then sends the person to sign in. */
export default function NewPasswordForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  return (
    <AuthForm
      schema={newPasswordSchema}
      submitLabel="Save new password"
      onSubmit={({ data, onSuccess, onError }) =>
        authApi
          .post('/reset-password', {
            newPassword: data.password,
            token,
          })
          .then(() => {
            onSuccess('');
            toast.success('Password changed. Sign in with the new one.');
            navigate('/login', { replace: true });
          })
          .catch(onError)
      }
      fields={({ register, errors }) => (
        <PasswordInput label="New password" autoComplete="new-password" required autoFocus placeholder="At least 8 characters" {...register('password')} error={fieldError(errors, 'password')} />
      )}
    />
  );
}
