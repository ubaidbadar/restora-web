import { Link, useSearchParams } from 'react-router';
import AuthCard from '../../components/auth_card';
import Button from '../../ui/button';
import NewPasswordForm from './new_password_form';
import RequestForm from './request_form';

/** Forgot password: ask for a link by email; the link comes back here with a token to choose a new password. */
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const failed = params.get('error');

  return (
    <AuthCard
      title={token ? 'Choose a new password' : 'Reset your password'}
      subtitle={token ? 'Every device signed in to your account will be signed out.' : 'Enter your email. We will send you a link to choose a new password.'}
      footer={
        <Button as={Link} to="/login" variant="primaryLink">
          Back to sign in
        </Button>
      }
    >
      {failed && <p role="alert" className="mb-4 rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">This link has expired or was already used. Ask for a new one.</p>}
      {token ? <NewPasswordForm /> : <RequestForm />}
    </AuthCard>
  );
}
