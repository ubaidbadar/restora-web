// One clearly primary action per area; everything else steps down in weight.
const buttonVariants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover',
  secondary: 'bg-primary-soft text-primary hover:bg-primary/15',
  outline: 'bg-surface border border-border-strong text-ink hover:bg-sunken',
  ghost: 'bg-transparent text-body hover:bg-hover hover:text-ink',
  danger: 'bg-surface border border-danger-200 text-danger-700 hover:bg-danger-50 hover:border-danger-300',
  // Text links keep their size in a sentence but get a 44px-tall tap area from an invisible ::after.
  link: 'relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[""] h-auto! px-0! bg-transparent text-ink underline underline-offset-4 decoration-border-strong hover:decoration-ink',
  /** A link inside text, in the brand color: "Create an account", "See all". */
  primaryLink: 'relative after:absolute after:-inset-x-1 after:-inset-y-3 after:content-[""] h-auto! px-0! rounded-small! bg-transparent font-semibold text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary',
  premium: 'bg-accent text-on-accent hover:bg-accent-alt',
};

export default buttonVariants;
