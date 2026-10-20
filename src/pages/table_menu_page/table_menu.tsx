import type PublicMenu from '../../types/public_menu';
import CallBar from './call_bar';
import DishCard from './dish_card';
import OptInCard from './opt_in_card';

interface TableMenuProps {
  menu: PublicMenu;
}

/** The menu by category (the chips jump to each one), the WhatsApp offer at the end, and the call buttons always in reach. */
export default function TableMenu({ menu }: TableMenuProps) {
  return (
    <div className="min-h-dvh bg-canvas pb-28 text-ink">
      <header className="bg-primary-soft px-4 pt-8 pb-5">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {menu.restaurant.logo && <img src={menu.restaurant.logo} alt="" className="size-14 rounded-card bg-surface object-contain p-1 shadow-card" />}
          <div className="min-w-0">
            <h1 className="truncate">{menu.restaurant.name}</h1>
            <p className="text-sm text-body">
              {menu.branch.name} · <span className="font-semibold text-primary">Table {menu.table.name}</span>
            </p>
          </div>
        </div>
      </header>

      <nav aria-label="Menu sections" className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur">
        <ul className="hide-scrollbar mx-auto flex max-w-xl gap-2 overflow-x-auto px-4 py-2.5">
          {menu.categories.map((category) => (
            <li key={category._id} className="shrink-0">
              <a href={`#c-${category._id}`} className="inline-flex min-h-10 items-center rounded-pill border border-border-strong bg-surface px-4 text-sm font-medium text-body hover:bg-sunken">
                {category.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="mx-auto flex max-w-xl flex-col gap-6 px-4 pt-5">
        {menu.categories.map((category) => (
          <section key={category._id} id={`c-${category._id}`} className="scroll-mt-16">
            <h2 className="mb-2">{category.name}</h2>
            <ul className="flex flex-col gap-2.5">
              {menu.items
                .filter((item) => item.categoryId === category._id)
                .map((item) => (
                  <DishCard key={item._id} dish={item} groups={menu.addonGroups.filter((group) => item.addonGroupIds.includes(group._id))} />
                ))}
            </ul>
          </section>
        ))}
        <OptInCard restaurantName={menu.restaurant.name} />
      </main>

      <CallBar />
    </div>
  );
}
