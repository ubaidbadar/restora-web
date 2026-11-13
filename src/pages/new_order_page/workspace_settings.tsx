import { LayoutGrid, PanelLeft, PanelRight, PanelsTopLeft, RotateCcw, Rows3 } from 'lucide-react';
import Button from '../../ui/button';
import DropdownMenu from '../../ui/dropdown_menu';
import useNewOrderWorkspaceStore from '../../store/new_order_workspace_store';

/** Desktop-only controls for the New order workspace; mobile keeps its existing layout. */
export default function WorkspaceSettings() {
  const { sidebarHidden, orderPanel, menuDensity, setPreferences, reset } = useNewOrderWorkspaceStore();
  const items = [
    { section: 'Navigation', label: 'Show sidebar', icon: PanelLeft, selected: !sidebarHidden, onClick: () => setPreferences({ sidebarHidden: false }) },
    { label: 'Hide sidebar', icon: PanelLeft, selected: sidebarHidden, onClick: () => setPreferences({ sidebarHidden: true }) },
    { section: 'Order details', label: 'Right column on wide screens', icon: PanelRight, selected: orderPanel === 'column', onClick: () => setPreferences({ orderPanel: 'column' }) },
    { label: 'Open in drawer', icon: PanelRight, selected: orderPanel === 'drawer', onClick: () => setPreferences({ orderPanel: 'drawer' }) },
    { section: 'Dish layout', label: 'Fewer columns', icon: Rows3, selected: menuDensity === 'comfortable', onClick: () => setPreferences({ menuDensity: 'comfortable' }) },
    { label: 'Balanced columns', icon: LayoutGrid, selected: menuDensity === 'balanced', onClick: () => setPreferences({ menuDensity: 'balanced' }) },
    { label: 'More columns', icon: LayoutGrid, selected: menuDensity === 'compact', onClick: () => setPreferences({ menuDensity: 'compact' }) },
    { section: 'Layout', label: 'Reset to defaults', icon: RotateCcw, onClick: reset },
  ];

  return (
    <div className="hidden lg:block">
      <DropdownMenu
        align="right"
        menuClassName="w-64"
        trigger={(open) => (
          <Button type="button" variant="outline" icon={PanelsTopLeft} aria-haspopup="menu" aria-expanded={open}>
            Layout options
          </Button>
        )}
        items={items}
      />
    </div>
  );
}
