import { useNavigate } from 'react-router';
import authApi from '../../config/auth_api';
import AuthForm from '../../components/auth_form';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import requestSchema from './request_schema';

/** Asks for a code (the email also has a link back here). The answer is the same whether or not the email has an account. */
export default function RequestForm() {
  const navigate = useNavigate();

  return (
    <AuthForm
      schema={requestSchema}
      submitLabel="Email me a code"
      busyLabel="Sending…"
      onSubmit={({ data, onSuccess, onError }) =>
        authApi
          .post('/request-password-reset', { email: data.email, redirectTo: `${window.location.origin}/reset-password` })
          .then(() => {
            onSuccess('');
            navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
          })
          .catch(onError)
      }
      fields={({ register, errors }) => (
        <Input label="Email" type="email" autoComplete="email" inputMode="email" required autoFocus {...register('email')} error={fieldError(errors, 'email')} />
      )}
    />
  );
}
