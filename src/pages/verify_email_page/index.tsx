import { Link, useSearchParams } from 'react-router';
import AuthCard from '../../components/auth_card';
import MailArt from '../../icons/mail_art';
import Button from '../../ui/button';
import ResendLink from './resend_link';

/** After sign-up (or signing in unverified): check your inbox. Opening the link signs you in. */
export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const next = params.get('next') ?? '/';

  return (
    <AuthCard
      art={<MailArt className="h-28" />}
      title="Check your email"
      subtitle={email ? `We sent a link to ${email}. Open it to confirm your email and sign in.` : 'Open the link we emailed you to confirm your email and sign in.'}
      footer={
        <Button as={Link} to="/login" variant="primaryLink">
          Back to sign in
        </Button>
      }
    >
      <div className="flex flex-col gap-3 text-sm text-body">
        <p>The link works for one hour. Not there? Look in spam, or send it again.</p>
        <ResendLink email={email} next={next} />
      </div>
    </AuthCard>
  );
}
