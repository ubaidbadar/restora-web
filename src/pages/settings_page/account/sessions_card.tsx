import { MonitorSmartphone } from 'lucide-react';
import SectionCard from '../../../components/section_card';
import api from '../../../config/api';
import useGet from '../../../hooks/useGet';
import type WebSession from '../../../types/web_session';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import SessionRow from './session_row';
import SkeletonList from '../../../components/skeleton_list';

/** Where your account is signed in. Sign out a lost phone, or every device but this one. */
export default function SessionsCard() {
  const { data: sessions = [], loading, update } = useGet<WebSession[]>('/me/sessions');
  const signOutOthers = () =>
    api
      .post('/me/sessions/revoke-others')
      .then(() => {
        update((current) => current?.filter((session) => session.current));
        toast.success('Every other device was signed out');
      })
      .catch(() => toast.error('Failed to sign out other devices'));

  return (
    <SectionCard
      title="Signed-in devices"
      description="Every phone, tablet and computer where your account is open."
      flush
      footer={sessions.length > 1 && <Button variant="outline" icon={MonitorSmartphone} onClick={signOutOthers}>Sign out all other devices</Button>}
    >
      {loading && <SkeletonList rows={2} variant="lines" />}
      <ul className="divide-y divide-border">
        {sessions.map((session) => (
          <SessionRow key={session.token} session={session} onRevoked={() => update((current) => current?.filter((item) => item.token !== session.token))} />
        ))}
      </ul>
    </SectionCard>
  );
}
