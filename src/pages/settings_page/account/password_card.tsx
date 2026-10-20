import SectionCard from '../../../components/section_card';
import authApi from '../../../config/auth_api';
import passwordSchema from '../../../constants/password_schema';
import Button from '../../../ui/button';
import Form from '../../../ui/form';
import PasswordInput from '../../../ui/password_input';
import fieldError from '../../../utils/field_error';
import toast from '../../../utils/toast';

/** Change your password. Every other device is signed out. */
export default function PasswordCard() {
  return (
    <Form
      schema={passwordSchema}
      noValidate
      onSubmit={({ data, onReset, onError }) =>
        authApi
          .post('/change-password', { currentPassword: data.current, newPassword: data.next, revokeOtherSessions: true })
          .then(() => {
            onReset();
            toast.success('Password changed. Other devices were signed out.');
          })
          .catch(onError)
      }
      component={({ register, errors, loading, error }) => (
        <SectionCard title="Password" description="Changing it signs out every other device." footer={<Button type="submit" disabled={loading}>Change password</Button>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput label="Current password" autoComplete="current-password" required {...register('current')} error={fieldError(errors, 'current') ?? error} />
            <PasswordInput label="New password" autoComplete="new-password" required placeholder="At least 8 characters" {...register('next')} error={fieldError(errors, 'next')} />
          </div>
        </SectionCard>
      )}
    />
  );
}
