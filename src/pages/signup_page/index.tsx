import { Link, useNavigate, useSearchParams } from 'react-router';
import AuthCard from '../../components/auth_card';
import AuthForm from '../../components/auth_form';
import Button from '../../ui/button';
import Input from '../../ui/input';
import PasswordInput from '../../ui/password_input';
import fieldError from '../../utils/field_error';
import safeNext from '../../utils/safe_next';
import authApi from '../../config/auth_api';
import GoogleSignIn from '../../components/google_sign_in';
import signupSchema from './schema';

/**
 * Create an account: name, email, password. We email a code to confirm the address; entering it (or opening
 * the link in the same email) signs the person in and continues to `next` (their invitation, or creating a restaurant).
 */
export default function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free for your whole team. Takes a minute."
      footer={
        <>
          Already have an account?{' '}
          <Button as={Link} to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} variant="primaryLink">
            Sign in
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <GoogleSignIn next={next} />
        <AuthForm
          schema={signupSchema}
          defaultValues={{ email: params.get('email') ?? '' }}
          submitLabel="Create account"
          busyLabel="Creating your account…"
          onSubmit={({ data, onSuccess, onError }) =>
            authApi
              // The code (or the emailed link) signs them in and opens `next` (their invitation, or creating a restaurant).
              .post('/sign-up/email', { ...data, callbackURL: next })
              .then(() => {
                onSuccess('');
                navigate(`/verify-email?email=${encodeURIComponent(data.email)}&next=${encodeURIComponent(next)}`, { replace: true });
              })
              .catch(onError)
          }
          fields={({ register, errors }) => (
            <>
              <Input label="Your name" dir="auto" autoComplete="name" required autoFocus {...register('name')} error={fieldError(errors, 'name')} />
              <Input label="Email" type="email" autoComplete="email" inputMode="email" required {...register('email')} error={fieldError(errors, 'email')} />
              <PasswordInput label="Password (at least 8 characters)" autoComplete="new-password" required {...register('password')} error={fieldError(errors, 'password')} />
            </>
          )}
        />
      </div>
    </AuthCard>
  );
}
