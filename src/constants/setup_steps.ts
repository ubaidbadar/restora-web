/** The first-run setup, in order: creating the restaurant (/onboarding), then tax, menu and optional WhatsApp (/welcome). */
const SETUP_STEPS = [
  { title: 'Your restaurant', hint: 'Name and first branch' },
  { title: 'Tax rates', hint: 'By payment method' },
  { title: 'Your menu', hint: 'Sample dishes or empty' },
  { title: 'WhatsApp', hint: 'Optional · customer messages' },
];

export default SETUP_STEPS;
