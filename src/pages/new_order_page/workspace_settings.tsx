import { Columns2, Columns3, LayoutGrid, PanelLeftClose, PanelLeftOpen, PanelRight, PanelsTopLeft, RotateCcw, Rows3 } from 'lucide-react';
import useNewOrderWorkspaceStore from '../../store/new_order_workspace_store';
import Button from '../../ui/button';
import DropdownMenu from '../../ui/dropdown_menu';
import IconButton from '../../ui/icon_button';

/** The controls affect only the order workspace, not navigation on other screens. */
export default function WorkspaceSettings() {
  const { sidebarHidden, orderPanel, menuColumns, setPreferences, reset } = useNewOrderWorkspaceStore();

  const items = [
    { section: 'Order workspace', label: 'Separate dishes and checkout columns', icon: Columns3, selected: orderPanel === 'split', onClick: () => setPreferences({ orderPanel: 'split' }) },
    { label: 'Combined order panel', icon: PanelRight, selected: orderPanel === 'column', onClick: () => setPreferences({ orderPanel: 'column' }) },
    { label: 'Open order in a drawer', icon: PanelRight, selected: orderPanel === 'drawer', onClick: () => setPreferences({ orderPanel: 'drawer' }) },
    { section: 'Menu dishes', label: 'Automatic columns', icon: LayoutGrid, selected: menuColumns === 'auto', onClick: () => setPreferences({ menuColumns: 'auto' }) },
    { label: 'Two columns', icon: Columns2, selected: menuColumns === '2', onClick: () => setPreferences({ menuColumns: '2' }) },
    { label: 'Three columns', icon: Columns3, selected: menuColumns === '3', onClick: () => setPreferences({ menuColumns: '3' }) },
    { label: 'Four columns', icon: LayoutGrid, selected: menuColumns === '4', onClick: () => setPreferences({ menuColumns: '4' }) },
    { label: 'Dish list', icon: Rows3, selected: menuColumns === 'list', onClick: () => setPreferences({ menuColumns: 'list' }) },
    { section: 'Preferences', label: 'Reset layout', icon: RotateCcw, onClick: reset },
  ];

  return (
    <div className="hidden shrink-0 items-center gap-1 lg:flex">
      <IconButton
        type="button"
        icon={sidebarHidden ? PanelLeftOpen : PanelLeftClose}
        aria-label={sidebarHidden ? 'Show navigation sidebar' : 'Hide navigation sidebar'}
        title={sidebarHidden ? 'Show sidebar' : 'Hide sidebar'}
        variant="outline"
        onClick={() => setPreferences({ sidebarHidden: !sidebarHidden })}
      />
      <DropdownMenu
        align="right"
        menuClassName="w-80"
        trigger={(open) => (
          <Button type="button" variant="outline" icon={PanelsTopLeft} aria-haspopup="menu" aria-expanded={open}>
            Layout
          </Button>
        )}
        items={items}
      />
    </div>
  );
}
