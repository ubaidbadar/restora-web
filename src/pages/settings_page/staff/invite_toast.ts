import toast from '../../../utils/toast';
import waLink from '../../../utils/wa_link';

/** After inviting or resending: the email is on its way (or the link is copied); a phone invitation is sent from your own WhatsApp. */
export default function inviteToast(who: string, { channel, phone, inviteUrl }: { channel?: string; phone?: string; inviteUrl: string }) {
  if (channel === 'phone' && phone) {
    toast.success(`Invitation ready for ${who}. Send it from your WhatsApp.`, { label: 'Open WhatsApp', onClick: () => window.open(waLink(phone, `Join us on Restora: ${inviteUrl}`), '_blank', 'noopener') });
    return;
  }
  toast.success(`Invitation emailed to ${who}`, { label: 'Copy link', onClick: () => void navigator.clipboard.writeText(inviteUrl).then(() => toast.info('Link copied')) });
}
