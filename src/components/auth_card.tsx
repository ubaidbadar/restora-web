import { type ReactNode } from 'react';
import AUTH_HIGHLIGHTS from '../constants/auth_highlights';
import AuthArt from '../icons/auth_art';
import BrandMark from './brand_mark';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  /** A line under the card, e.g. the link to the other screen. */
  footer?: ReactNode;
  /** A small drawing above the title, for screens that tell rather than ask (an email sent, an invitation). */
  art?: ReactNode;
}

/**
 * The screens before the app itself: sign in, sign up and password reset.
 * One white page. Wide screens show the Restora drawing beside the form, which sits in a card; phones get just the logo and the form.
 */
export default function AuthCard({ title, subtitle, children, footer, art }: AuthCardProps) {
  return (
    <div className="flex min-h-dvh bg-surface font-body text-ink">
      <aside className="hidden flex-1 text-center shrink-0 flex-col justify-between gap-8 p-10 lg:flex xl:p-14">
        <BrandMark />
        <AuthArt className="w-full max-w-lg self-center" />
        <div className="flex flex-col gap-4">
          <p className="text-3xl leading-tight font-semibold tracking-tight text-balance">Every order, every guest, one place.</p>
          <ul className="flex justify-center flex-wrap gap-2" aria-label="What Restora does">
            {AUTH_HIGHLIGHTS.map((highlight) => (
              <li key={highlight} className="rounded-pill bg-surface px-3 py-1 text-sm text-body shadow-card">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-8 lg:justify-center">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="lg:rounded-card lg:p-7 lg:shadow-card">
            {art && <div className="mb-5 flex justify-center">{art}</div>}
            <h1 className={`text-ink ${art ? 'text-center' : ''}`}>{title}</h1>
            <p className={`mt-1 mb-6 text-sm text-muted ${art ? 'text-center text-balance' : ''}`}>{subtitle}</p>
            {children}
          </div>
          {footer && <p className="text-sm text-muted lg:text-center">{footer}</p>}
        </div>
      </main>
    </div>
  );
}
