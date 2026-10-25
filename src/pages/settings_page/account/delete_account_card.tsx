import { Trash2 } from 'lucide-react';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import AlertModal from '../../../ui/alert_modal/modal';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import getAxiosMessage from '../../../utils/get_axios_message';
import signOut from '../../../utils/sign_out';

/** Delete your entire account, profile, and all active sessions. */
export default function DeleteAccountCard() {
  const deleteAccount = () =>
    api
      .delete('/me')
      .then(async () => {
        toast.success('Your account has been deleted');
        await signOut();
      })
      .catch((err) => toast.error(getAxiosMessage(err)));

  return (
    <SectionCard
      title="Delete account"
      description="Permanently delete your user account, your profile, and all active sessions. This cannot be undone."
    >
      <AlertModal
        title="Delete your account?"
        description="Your profile and all sessions will be deleted permanently. If you are the owner of any active restaurant, transfer ownership or delete the restaurant first."
        confirmText="Delete account"
        cancelText="Keep account"
        onConfirm={deleteAccount}
        component={({ open }) => (
          <Button variant="danger" icon={Trash2} onClick={open}>
            Delete account
          </Button>
        )}
      />
    </SectionCard>
  );
}
