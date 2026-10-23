import type Me from '@shared/me';
import PERMISSION_CATALOG from '@shared/permission_catalog';

/** A signed-in owner at Main of Test Grill, with Gulberg as a second branch. Tests change what they need. */
export default function sampleMe(): Me {
  return {
    user: { id: 'u1', name: 'Owner', email: 'owner@test.com' },
    mode: 'web',
    restaurants: [
      { _id: 'r1', name: 'Test Grill', isOwner: true },
      { _id: 'r2', name: 'Other Place' },
    ],
    workplace: {
      restaurant: { _id: 'r1', name: 'Test Grill' },
      roleNames: ['Owner'],
      isOwner: true,
      isPrimaryOwner: true,
      hasPin: false,
      // An owner gets the whole catalog, as /me answers it.
      permissions: PERMISSION_CATALOG.map((entry) => entry.permission),
      branch: { _id: 'b1', name: 'Main' },
      allBranches: true,
      branches: [
        { _id: 'b1', name: 'Main' },
        { _id: 'b2', name: 'Gulberg' },
      ],
      settings: {
        onboarded: true,
        taxSet: true,
        taxByPaymentMethod: { cash: 15, card: 5, jazzcash: 5, easypaisa: 5, bank: 5 },
        whatsappTemplates: { winback: '', reservation: '' },
      },
    },
  };
}
