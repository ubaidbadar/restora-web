import useAuthStore from '../../store/auth_store';
import Button from '../../ui/button';
import signOut from '../../utils/sign_out';

/** "Signed in as …. Sign out" under the card. */
export default function SignedInAs() {
  const email = useAuthStore((state) => state.me?.user.email);
  return (
    <>
      Signed in as {email}.{' '}
      <Button variant="primaryLink" onClick={() => void signOut()}>
        Sign out
      </Button>
    </>
  );
}
