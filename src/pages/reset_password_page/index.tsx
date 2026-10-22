import { Link, useSearchParams } from 'react-router';
import AuthCard from '../../components/auth_card';
import Button from '../../ui/button';
import CodeForm from './code_form';
import NewPasswordForm from './new_password_form';
import RequestForm from './request_form';

/**
 * Forgot password: ask for a code by email, then enter it with a new password. The same email has a link that
 * comes back here with a token instead, for older apps and anyone who would rather tap.
 */
export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const email = params.get('email');
  const failed = params.get('error');
  const subtitle = token
    ? 'Every device signed in to your account will be signed out.'
    : email
      ? `If ${email} has an account, we sent it a 6-digit code. It works for 10 minutes. Every device signed in to the account will be signed out.`
      : 'Enter your email. We will send you a code to choose a new password.';

  return (
    <AuthCard
      title={token || email ? 'Choose a new password' : 'Reset your password'}
      subtitle={subtitle}
      footer={
        <Button as={Link} to="/login" variant="primaryLink">
          Back to sign in
        </Button>
      }
    >
      {failed && <p role="alert" className="mb-4 rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm text-danger-700">This link has expired or was already used. Ask for a new code.</p>}
      {token ? <NewPasswordForm /> : email ? <CodeForm email={email} /> : <RequestForm />}
    </AuthCard>
  );
}
