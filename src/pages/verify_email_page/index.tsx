import { Link, useSearchParams } from 'react-router';
import AuthCard from '../../components/auth_card';
import MailArt from '../../icons/mail_art';
import Button from '../../ui/button';
import safeNext from '../../utils/safe_next';
import CodeForm from './code_form';
import ResendLink from './resend_link';

/** After sign-up (or signing in unverified): type the emailed code, or open the link in the same email. Either signs you in. */
export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const email = params.get('email') ?? '';
  const next = safeNext(params.get('next'));

  return (
    <AuthCard
      art={<MailArt className="h-28" />}
      title="Check your email"
      subtitle={email ? `We sent a 6-digit code to ${email}. Enter it to confirm your email and sign in.` : 'Open the link we emailed you to confirm your email and sign in.'}
      footer={
        <Button as={Link} to="/login" variant="primaryLink">
          Back to sign in
        </Button>
      }
    >
      <div className="flex flex-col gap-3 text-sm text-body">
        {email && <CodeForm email={email} next={next} />}
        <p>The code works for 10 minutes. Not there? Look in spam, or send a new one.</p>
        <ResendLink email={email} next={next} />
      </div>
    </AuthCard>
  );
}
