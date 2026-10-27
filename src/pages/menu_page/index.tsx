import LoadFailed from '../../components/load_failed';
import Skeleton from '../../ui/skeleton';
import SkeletonList from '../../components/skeleton_list';
import PageHeader from '../../components/page_header';
import useGet from '../../hooks/useGet';
import type Menu from '../../types/menu';
import MenuTabs from './menu_tabs';

/** The restaurant's menu, shared by every branch: dishes, their categories and add-on groups. */
export default function MenuPage() {
  const { data: menu, loading, get, update } = useGet<Menu>('/menu');
  if (!menu) return loading ? (
    <div role="status" aria-label="Loading the menu" className="flex flex-col gap-5">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-control w-72 rounded-control" />
      <SkeletonList rows={6} />
    </div>
  ) : <LoadFailed what="the menu" onRetry={() => get()} />;
  console.log(menu)
  const deals = menu.items.filter((item) => item.includes.length > 0).length;
  const dishes = menu.items.length - deals;
  const onUpdate = (changes: Partial<Menu>) => update((current) => (current ? { ...current, ...changes } : current));

  return (
    <>
      <PageHeader
        title="Menu"
        subtitle={`${dishes} ${dishes === 1 ? 'dish' : 'dishes'}${deals ? ` and ${deals} ${deals === 1 ? 'deal' : 'deals'}` : ''} in ${menu.categories.length} ${menu.categories.length === 1 ? 'category' : 'categories'}`}
      />
      <MenuTabs menu={menu} onUpdate={onUpdate} />
    </>
  );
}
