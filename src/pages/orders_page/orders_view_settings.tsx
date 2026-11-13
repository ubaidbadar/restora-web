import { LayoutGrid, PanelsTopLeft, PanelLeft, PanelRight, Rows3, RotateCcw } from 'lucide-react';
import Button from '../../ui/button';
import DropdownMenu from '../../ui/dropdown_menu';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';

export default function OrdersViewSettings() {
  const { sidebarHidden, detailsPanel, density, setPreferences, reset } = useOrdersWorkspaceStore();

  return (
    <DropdownMenu
      align="right"
      menuClassName="w-64"
      trigger={(open) => (
        <Button type="button" variant="outline" icon={PanelsTopLeft} aria-haspopup="menu" aria-expanded={open}>
          View options
        </Button>
      )}
      items={[
        {
          section: 'Workspace',
          label: 'Show navigation sidebar',
          icon: PanelLeft,
          selected: !sidebarHidden,
          onClick: () => setPreferences({ sidebarHidden: false }),
        },
        {
          label: 'Hide navigation sidebar',
          icon: PanelLeft,
          selected: sidebarHidden,
          onClick: () => setPreferences({ sidebarHidden: true }),
        },
        {
          label: 'Show separate order details',
          icon: PanelRight,
          selected: detailsPanel,
          onClick: () => setPreferences({ detailsPanel: true }),
        },
        {
          label: 'Hide separate order details',
          icon: PanelRight,
          selected: !detailsPanel,
          onClick: () => setPreferences({ detailsPanel: false }),
        },
        {
          section: 'Order cards',
          label: 'Comfortable spacing',
          icon: Rows3,
          selected: density === 'comfortable',
          onClick: () => setPreferences({ density: 'comfortable' }),
        },
        {
          label: 'Compact spacing',
          icon: LayoutGrid,
          selected: density === 'compact',
          onClick: () => setPreferences({ density: 'compact' }),
        },
        {
          section: 'Layout',
          label: 'Reset to defaults',
          icon: RotateCcw,
          onClick: reset,
        },
      ]}
    />
  );
}
