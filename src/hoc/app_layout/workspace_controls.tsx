import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import api from '../../config/api';
import useWorkplace from '../../hooks/useWorkplace';
import useAuthStore from '../../store/auth_store';
import Button from '../../ui/button';
import IconButton from '../../ui/icon_button';
import ModalOverlay from '../../ui/modal/modal';
import Toggle from '../../ui/toggle';
import DEFAULT_WORKSPACE_PREFERENCES from '../../constants/default_workspace_preferences';
import getAxiosMessage from '../../utils/get_axios_message';
import toast from '../../utils/toast';
import type Workplace from '@shared/workplace';

type OrderPreferences = NonNullable<Workplace['preferences']>['orders'];

/** Personal desktop layout controls; the saved preferences are returned by /me on mobile too. */
export default function WorkspaceControls() {
  const workplace = useWorkplace();
  const [saving, setSaving] = useState(false);
  if (!workplace) return null;
  const preferences = workplace.preferences ?? DEFAULT_WORKSPACE_PREFERENCES;

  const save = (orders: Partial<OrderPreferences>) => {
    if (saving) return;
    setSaving(true);
    api.patch('/me/preferences', { orders })
      .then((res) => useAuthStore.getState().setWorkplace({ preferences: res.data.preferences }))
      .catch((err) => toast.error(getAxiosMessage(err)))
      .finally(() => setSaving(false));
  };

  return (
    <ModalOverlay
      title="Workspace layout"
      component={({ open }) => <IconButton icon={SlidersHorizontal} variant="outline" aria-label="Workspace layout settings" onClick={open} />}
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3">
          <div>
            <h3 className="font-semibold text-ink">Navigation</h3>
            <p className="mt-1 text-sm text-muted">Use the full desktop width for orders without changing navigation on other pages.</p>
          </div>
          <Toggle
            checked={preferences.orders.sidebarHidden}
            disabled={saving}
            label="Hide sidebar on the Orders page"
            onChange={(event) => save({ sidebarHidden: event.target.checked })}
          />
        </section>
        <section className="flex flex-col gap-3 border-t border-border pt-5">
          <div>
            <h3 className="font-semibold text-ink">Orders</h3>
            <p className="mt-1 text-sm text-muted">Choose how much space the board and its details use.</p>
          </div>
          <Toggle
            checked={preferences.orders.detailsPanel}
            disabled={saving}
            label="Show a separate order details panel"
            onChange={(event) => save({ detailsPanel: event.target.checked })}
          />
          <Toggle
            checked={preferences.orders.density === 'compact'}
            disabled={saving}
            label="Use compact order cards"
            onChange={(event) => save({ density: event.target.checked ? 'compact' : 'comfortable' })}
          />
        </section>
        <p className="text-xs text-muted">{saving ? 'Saving your layout…' : 'These personal preferences sync with your account and are kept when you use Restora on mobile. The desktop-only layout controls stay off the phone screen.'}</p>
        <div className="flex justify-end border-t border-border pt-3">
          <Button variant="ghost" disabled={saving} onClick={() => save(DEFAULT_WORKSPACE_PREFERENCES.orders)}>Reset layout</Button>
        </div>
      </div>
    </ModalOverlay>
  );
}
