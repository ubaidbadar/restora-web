import api from '../../config/api';
import useAuthStore from '../../store/auth_store';
import AlertModal from '../../ui/alert_modal/modal';
import Button from '../../ui/button';
import getAxiosMessage from '../../utils/get_axios_message';
import signOut from '../../utils/sign_out';
import toast from '../../utils/toast';

/**
 * "Signed in as …. Sign out" under the card, with "Delete account" for someone who works nowhere yet: anyone else
 * deletes it from Settings › My account.
 */
export default function SignedInAs({ canDelete }: { canDelete: boolean }) {
  const email = useAuthStore((state) => state.me?.user.email);

  const deleteAccount = () =>
    api
      .delete('/me')
      .then(async () => {
        toast.success('Your account has been deleted');
        await signOut();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <span className="flex flex-wrap items-center justify-center gap-1.5 text-center">
      <span>Signed in as {email}.</span>
      <Button variant="primaryLink" onClick={() => void signOut()}>
        Sign out
      </Button>
      {canDelete && <span>·</span>}
      {canDelete && <AlertModal
        title="Delete your account?"
        description="Your profile and all sessions will be deleted permanently. If you own an active restaurant, you must transfer ownership or delete it first."
        confirmText="Delete account"
        cancelText="Keep account"
        onConfirm={deleteAccount}
        component={({ open }) => (
          <Button variant="primaryLink" className="text-danger-600 hover:text-danger-700" onClick={open}>
            Delete account
          </Button>
        )}
      />}
    </span>
  );
}
