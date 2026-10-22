import { useSearchParams } from 'react-router';
import authApi from '../config/auth_api';
import useGet from '../hooks/useGet';
import GoogleIcon from '../icons/google_icon';
import Button from '../ui/button';
import getAxiosMessage from '../utils/get_axios_message';
import toast from '../utils/toast';

/** Why Google sent them back to sign in (`?error=` from the server), in words. */
const GOOGLE_ERRORS: Record<string, string> = {
  account_not_linked: 'This email already has a Restora account that is not confirmed yet. Sign in with your password and confirm your email first, then Google works too.',
  unable_to_create_user: 'Google has not confirmed this email, so we could not make an account with it. Sign up with your email instead.',
  access_denied: 'Google sign-in was cancelled.',
};

/**
 * "Continue with Google" above the email form, on sign in and sign up. Shown only when the server has Google set up.
 * Google's page brings them back to `next`, signed in; a problem brings them back to sign in with `?error=`.
 */
export default function GoogleSignIn({ next }: { next: string }) {
  const [params] = useSearchParams();
  const { data } = useGet<{ web: string[] }>('/public/sign-in-providers');
  const error = params.get('error');
  if (!data?.web.includes('google')) return null;

  const signIn = () =>
    authApi
      .post('/sign-in/social', {
        provider: 'google',
        callbackURL: `${window.location.origin}${next}`,
        errorCallbackURL: `${window.location.origin}/login?next=${encodeURIComponent(next)}`,
      })
      .then((res) => window.location.assign(res.data.url))
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-control border border-danger-200 bg-danger-50 px-3 py-2 text-sm font-medium text-danger-700">
          {GOOGLE_ERRORS[error] ?? 'Google sign-in did not finish. Please try again.'}
        </p>
      )}
      <Button type="button" variant="outline" size="lg" className="w-full" onClick={signIn}>
        <GoogleIcon />
        Continue with Google
      </Button>
      <p className="flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">or</p>
    </div>
  );
}
