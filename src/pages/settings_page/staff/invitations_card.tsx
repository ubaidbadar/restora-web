import { UserPlus } from 'lucide-react';
import api from '../../../config/api';
import FormDrawer from '../../../components/form_drawer';
import SectionCard from '../../../components/section_card';
import useGet from '../../../hooks/useGet';
import type Invitation from '../../../types/invitation';
import type Role from '../../../types/role';
import Button from '../../../ui/button';
import Can from '../../../components/can';
import InvitationRow from './invitation_row';
import inviteToast from './invite_toast';
import InviteFields from './invite_fields';
import inviteSchema from './invite_schema';
import SkeletonList from '../../../components/skeleton_list';

/**
 * Inviting people (`staff:invite`) by email or WhatsApp, and the open invitations. Resend gives a fresh link; cancel
 * stops the old one working. They join with the roles and branches picked here.
 */
export default function InvitationsCard({ roles }: { roles: Role[] }) {
  const { data: items = [], loading, update } = useGet<Invitation[]>('/invitations');

  return (
    <SectionCard
      title="Invitations"
      description="Invite people to join with their own account. A link works for 7 days."
      flush
      action={
        <Can permission="staff:invite">
        <FormDrawer
          title="Invite someone"
          schema={inviteSchema}
          defaultValues={{ channel: 'email', branchScope: 'all', roleIds: [], branchIds: [] }}
          submitLabel="Send invitation"
          busyLabel="Sending…"
          onSave={(values) =>
            api
              .post('/invitations', values)
              .then((res) => {
                inviteToast(values.name || values.email || values.phone, res.data);
                // Inviting the same person again replaces their earlier invitation.
                update((current) => [res.data, ...(current ?? []).filter((item) => item.status !== 'pending' || (item.email ?? item.phone) !== (res.data.email ?? res.data.phone))]);
              })
          }
          fields={(form) => <InviteFields {...form} roles={roles} />}
          component={({ open }) => <Button variant="outline" icon={UserPlus} onClick={open}>Invite</Button>}
        />
        </Can>
      }
    >
      {loading && <SkeletonList rows={2} variant="lines" />}
      {!loading && !items.length && <p className="px-5 py-4 text-sm text-muted sm:px-6">No open invitations.</p>}
      <ul className="divide-y divide-border">
        {items.map((invitation) => (
          <InvitationRow key={invitation._id} invitation={invitation} onChanged={(saved) => update((current) => current?.map((item) => (item._id === saved._id ? saved : item)))} />
        ))}
      </ul>
    </SectionCard>
  );
}
