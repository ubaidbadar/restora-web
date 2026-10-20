import authApi from '../../config/auth_api';
import AuthForm from '../../components/auth_form';
import MailArt from '../../icons/mail_art';
import Input from '../../ui/input';
import fieldError from '../../utils/field_error';
import requestSchema from './request_schema';

/** Asks for the reset link. The answer is the same whether or not the email has an account. */
export default function RequestForm() {
  return (
    <AuthForm
      schema={requestSchema}
      submitLabel="Email me a link"
      busyLabel="Sending…"
      onSubmit={({ data, onSuccess, onError }) =>
        authApi
          .post('/request-password-reset', { email: data.email, redirectTo: `${window.location.origin}/reset-password` })
          .then(() => onSuccess(''))
          .catch(onError)
      }
      fields={({ register, errors, message }) =>
        message === '' ? (
          <div className="flex flex-col items-center gap-4">
            <MailArt className="h-28" />
            <p role="status" className="rounded-control bg-success-50 px-3 py-2 text-center text-sm text-success-700">If this email has an account, a link is on its way. It works for one hour.</p>
          </div>
        ) : (
          <Input label="Email" type="email" autoComplete="email" inputMode="email" required autoFocus {...register('email')} error={fieldError(errors, 'email')} />
        )
      }
    />
  );
}
