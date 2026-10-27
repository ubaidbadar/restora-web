import useGet from '../../../hooks/useGet';
import type Menu from '../../../types/menu';
import AgentsCard from './agents_card';
import DownloadCard from './download_card';

/** Get the print agent, pair a PC and set what each of its printers prints. */
export default function PrintersTab() {
  // Only the category names are needed (to pick what a kitchen printer prints); the answer is shared with the Menu page.
  const { data: menu } = useGet<Menu>('/menu');
  return (
    <div className="flex flex-col gap-6">
      <DownloadCard />
      <AgentsCard categories={menu?.categories ?? []} />
    </div>
  );
}
