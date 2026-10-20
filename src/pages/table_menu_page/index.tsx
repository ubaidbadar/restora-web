import { useParams } from 'react-router';
import { QrCode } from 'lucide-react';
import EmptyState from '../../components/empty_state';
import SkeletonList from '../../components/skeleton_list';
import useGet from '../../hooks/useGet';
import type PublicMenu from '../../types/public_menu';
import TableMenu from './table_menu';

/** What a guest's phone opens from a table's QR code: no sign-in, no app chrome, just the menu and the call buttons. */
export default function TableMenuPage() {
  const { code = '' } = useParams<{ code: string }>();
  const { data: menu, loading } = useGet<PublicMenu>(`/public/t/${code}`);
  if (!menu) return loading ? <div className="mx-auto max-w-lg p-4"><SkeletonList rows={6} /></div> : <EmptyState icon={QrCode} title="This QR code doesn't work" text="Please ask a waiter for the menu." titleAs="h1" />;
  return <TableMenu menu={menu} />;
}
