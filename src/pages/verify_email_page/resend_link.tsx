import { useState } from 'react';
import authApi from '../../config/auth_api';
import Button from '../../ui/button';
import toast from '../../utils/toast';

interface ResendLinkProps {
  email: string;
  /** Where the link takes them after confirming. */
  next: string;
}

/** Sends the verification email again. */
export default function ResendLink({ email, next }: ResendLinkProps) {
  const [loading, setLoading] = useState(false);
  if (!email) return null;

  const handleResend = () => {
    setLoading(true);
    authApi
      .post('/send-verification-email', { email, callbackURL: next })
      .then(() => toast.success('Sent. Check your inbox.'))
      .catch((err) => toast.error(err.response?.data?.message || 'Could not send the email. Try again in a minute.'))
      .finally(() => setLoading(false))
  };

  return (
    <Button disabled={loading} variant="outline" size="lg" onClick={handleResend}>
      Send the link again
    </Button>
  );
}
