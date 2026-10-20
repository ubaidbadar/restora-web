import api from '../../config/api';
import Can from '../../components/can';
import PageHeader from '../../components/page_header';
import SkeletonGrid from '../../components/skeleton_grid';
import useGet from '../../hooks/useGet';
import type FloorTable from '../../types/floor_table';
import type Table from '../../types/table';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';
import AddTableButtons from './add_table_buttons';
import TablesView from './tables_view';

/**
 * The branch's tables, one screen for everyone: each table and what it needs now, guest calls on top, narrowed by
 * All / Busy / Free. People who manage tables also add them from the header, edit, print or archive one from its sheet,
 * and bring archived ones back under Archived.
 */
export default function TablesPage() {
  const { data: all = [], loading, update } = useGet<FloorTable[]>('/tables/floor');
  const tables = all.filter((table) => !table.archived);
  const sections = [...new Set(tables.map((table) => table.section ?? ''))];

  // A saved table (added, edited, archived, brought back, new QR code) keeps what is going on at it.
  const save = (...saved: Table[]) =>
    update((current = []) => {
      const next = [...current];
      for (const table of saved) {
        const at = next.findIndex((item) => item._id === table._id);
        if (at >= 0) next[at] = { ...next[at]!, ...table };
        else next.push({ orders: [], requests: [], booking: null, ...table });
      }
      return next;
    });

  const answer = (requestId: string) => {
    api
      .post(`/guest-requests/${requestId}/resolve`)
      .then(() => {
        update((current) => current?.map((table) => ({ ...table, requests: table.requests.filter((request) => request._id !== requestId) })));
        toast.success('Call answered');
      })
      .catch((err) => toast.error(getAxiosMessage(err)));
  };

  return (
    <>
      <PageHeader title="Tables" subtitle="Who needs you, table by table">
        <Can permission="tables:manage">
          <AddTableButtons sections={sections.filter(Boolean)} hasTables={tables.length > 0} onAdded={save} />
        </Can>
      </PageHeader>
      {loading ? <SkeletonGrid /> : <TablesView all={all} onAnswer={answer} onSaved={save} />}
    </>
  );
}
