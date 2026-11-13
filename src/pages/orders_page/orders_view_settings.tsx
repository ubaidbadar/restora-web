import { PanelsTopLeft } from 'lucide-react';
import Button from '../../ui/button';
import DropdownMenu from '../../ui/dropdown_menu';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';

interface OrdersViewSettingsProps {
  page?: 'orders' | 'new-order';
}

/** A small, anchored menu for desktop-only workspace preferences; order filters stay in their own control. */
export default function OrdersViewSettings({ page = 'orders' }: OrdersViewSettingsProps) {
  const { sidebarHidden, detailsPanel, density, menuDensity, setPreferences, reset } = useOrdersWorkspaceStore();
  const items = page === 'orders'
    ? [
        { label: 'Hide navigation sidebar', selected: sidebarHidden, onClick: () => setPreferences({ sidebarHidden: !sidebarHidden }) },
        { label: 'Separate order details panel', selected: detailsPanel, onClick: () => setPreferences({ detailsPanel: !detailsPanel }) },
        { label: 'Compact order cards', selected: density === 'compact', onClick: () => setPreferences({ density: density === 'compact' ? 'comfortable' : 'compact' }) },
        { label: 'Reset layout', section: 'Reset', onClick: reset },
      ]
    : [
        { label: 'Hide navigation sidebar', selected: sidebarHidden, onClick: () => setPreferences({ sidebarHidden: !sidebarHidden }) },
        { label: 'Compact dish tiles', selected: menuDensity === 'compact', onClick: () => setPreferences({ menuDensity: menuDensity === 'compact' ? 'comfortable' : 'compact' }) },
        { label: 'Reset layout', section: 'Reset', onClick: reset },
      ];

  return (
    <DropdownMenu
      trigger={(open) => (
        <Button type="button" variant="outline" icon={PanelsTopLeft} aria-haspopup="menu" aria-expanded={open}>
          View options
        </Button>
      )}
      items={items}
      menuClassName="w-64"
    />
  );
}
