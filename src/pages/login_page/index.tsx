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
import useAuthStore from '../../store/auth_store';
import loginSchema from './schema';

/** Sign in with email and password. With `?add=1` it adds another account to this browser. */
export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const adding = params.get('add') === '1';

  return (
    <AuthCard
      title={adding ? 'Add another account' : 'Sign in'}
      subtitle={adding ? 'Sign in with another account. You can switch between them from the account menu.' : 'Welcome back to Restora.'}
      footer={
        <>
          New to Restora?{' '}
          <Button as={Link} to={`/signup${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} variant="primaryLink">
            Create an account
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <GoogleSignIn next={adding ? '/' : next} />
        <AuthForm
          schema={loginSchema}
          submitLabel="Sign in"
          busyLabel="Signing in…"
          onSubmit={({ data, onSuccess, onError }) =>
            authApi
              .post('/sign-in/email', data)
              .then((res) => {
                // The answer carries /me (who they are, where they work): no second request.
                useAuthStore.getState().setMe(res.data.me);
                onSuccess('');
                navigate(adding ? '/' : next, { replace: true });
              })
              .catch((err) => {
                // Not confirmed yet: a fresh code was just emailed.
                if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
                  onSuccess('');
                  navigate(`/verify-email?email=${encodeURIComponent(data.email)}&next=${encodeURIComponent(next)}`, { replace: true });
                  return;
                }
                onError(err);
              })
          }
          fields={({ register, errors }) => (
            <>
              <Input label="Email" type="email" autoComplete="email" inputMode="email" required autoFocus {...register('email')} error={fieldError(errors, 'email')} />
              <PasswordInput label="Password" autoComplete="current-password" required {...register('password')} error={fieldError(errors, 'password')} />
              <Button as={Link} to="/reset-password" variant="primaryLink" className="self-end text-sm">
                Forgot password?
              </Button>
            </>
          )}
        />
      </div>
    </AuthCard>
  );
}
