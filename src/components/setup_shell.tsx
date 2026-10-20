import { type ReactNode } from 'react';
import SETUP_STEPS from '../constants/setup_steps';
import useAuthStore from '../store/auth_store';
import signOut from '../utils/sign_out';
import Button from '../ui/button';
import ProgressBar from '../ui/progress_bar';
import BrandMark from './brand_mark';
import SetupStepper from './setup_stepper';

interface SetupShellProps {
  /** The step on screen, from 1 (see constants/setup_steps). */
  step: number;
  title: string;
  description: string;
  children: ReactNode;
  /** A line under the card, e.g. the link to invitations. */
  footer?: ReactNode;
}

/**
 * The first-run setup: a workspace, not a sign-in screen. A top bar with the logo and who is signed in, the steps down
 * the side (a progress bar on phones), and the current step in a card.
 */
export default function SetupShell({ step, title, description, children, footer }: SetupShellProps) {
  const email = useAuthStore((state) => state.me?.user.email);
  const total = SETUP_STEPS.length;
  return (
    <div className="min-h-dvh bg-canvas font-body text-ink">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandMark />
          <div className="flex min-w-0 items-center gap-2">
            {email && <span className="hidden truncate text-sm text-muted sm:block">{email}</span>}
            <Button variant="ghost" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[15rem_1fr] lg:gap-10">
        <aside className="hidden lg:block">
          <p className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">Set up Restora</p>
          <p className="mb-6 text-sm text-body">A few minutes. Everything can be changed later in Settings.</p>
          <SetupStepper step={step} />
        </aside>

        <main className="min-w-0">
          <div className="mb-4 lg:hidden">
            <p className="mb-2 text-xs font-semibold text-muted">
              Step {step} of {total} · {SETUP_STEPS[step - 1]?.title}
            </p>
            <ProgressBar value={(step / total) * 100} ariaLabel={`Setup step ${step} of ${total}`} className="h-1.5" />
          </div>
          <section className="max-w-2xl rounded-card bg-surface shadow-card">
            <header className="border-b border-border px-5 py-5 sm:px-7">
              <p className="hidden text-xs font-semibold text-primary lg:block">
                Step {step} of {total}
              </p>
              <h1 className="mt-1 text-ink">{title}</h1>
              <p className="mt-1 text-sm text-muted">{description}</p>
            </header>
            {children}
          </section>
          {footer && <p className="mt-4 max-w-2xl text-sm text-muted">{footer}</p>}
        </main>
      </div>
    </div>
  );
}
