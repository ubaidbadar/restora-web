import { PanelsTopLeft } from 'lucide-react';
import Button from '../../ui/button';
import ModalOverlay from '../../ui/modal/modal';
import Toggle from '../../ui/toggle';
import useOrdersWorkspaceStore from '../../store/orders_workspace_store';

export default function OrdersViewSettings() {
  const { sidebarHidden, detailsPanel, density, setPreferences, reset } = useOrdersWorkspaceStore();

  return (
    <ModalOverlay
      title="Orders view options"
      component={({ open }) => (
        <Button type="button" variant="outline" icon={PanelsTopLeft} onClick={open}>
          View options
        </Button>
      )}
    >
      <div className="flex flex-col gap-5">
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-ink">Workspace</h3>
            <p className="mt-1 text-sm text-muted">Choose how much room the Orders page uses on your desktop.</p>
          </div>
          <Toggle
            checked={sidebarHidden}
            label="Hide navigation sidebar"
            onChange={(event) => setPreferences({ sidebarHidden: event.target.checked })}
          />
          <Toggle
            checked={detailsPanel}
            label="Show a separate order details panel"
            onChange={(event) => setPreferences({ detailsPanel: event.target.checked })}
          />
        </section>
        <section className="flex flex-col gap-3 border-t border-border pt-5">
          <div>
            <h3 className="font-semibold text-ink">Order cards</h3>
            <p className="mt-1 text-sm text-muted">Compact cards show more orders at once. Comfortable keeps the current spacing.</p>
          </div>
          <Toggle
            checked={density === 'compact'}
            label="Use compact order cards"
            onChange={(event) => setPreferences({ density: event.target.checked ? 'compact' : 'comfortable' })}
          />
        </section>
        <p className="text-xs text-muted">These settings affect only the desktop Orders page and are saved in this browser. New Order, phones and tablets keep their existing layout.</p>
        <div className="flex justify-end border-t border-border pt-3">
          <Button type="button" variant="ghost" onClick={reset}>Reset to defaults</Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
