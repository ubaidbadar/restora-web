import type Workplace from '@shared/workplace';

const DEFAULT_WORKSPACE_PREFERENCES: NonNullable<Workplace['preferences']> = {
  orders: {
    sidebarHidden: false,
    detailsPanel: false,
    density: 'comfortable',
  },
};

export default DEFAULT_WORKSPACE_PREFERENCES;
