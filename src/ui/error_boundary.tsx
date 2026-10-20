import { House, RefreshCw, RotateCcw, TriangleAlert } from 'lucide-react';
import { Component, type ReactNode } from 'react';
import Button from './button';

interface ErrorBoundaryProps {
  children?: ReactNode;
  /** An error caught elsewhere (React Router's `useRouteError()`): shows the screen straight away, with no "Try again". */
  error?: unknown;
}

interface ErrorBoundaryState {
  error: unknown;
}

/**
 * Catches a crash while its children render and shows a calm error screen in their place, with "Try again".
 * Given `error`, it is just that screen (the route's `errorElement`).
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  override state: ErrorBoundaryState = { error: undefined };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  reset = (): void => this.setState({ error: undefined });

  override render(): ReactNode {
    const caught = this.state.error !== undefined;
    const error = caught ? this.state.error : this.props.error;
    if (error === undefined) return this.props.children;
    const details = error instanceof Error ? error.stack || error.message : String(error);

    return (
      <div role="alert" className="grid min-h-[70dvh] place-items-center px-4 py-10">
        <div className="flex max-w-sm flex-col items-center text-center">
          <span className="mb-4 grid size-14 place-items-center rounded-full bg-danger-50 text-danger-600">
            <TriangleAlert size={26} aria-hidden="true" />
          </span>
          <h1 className="text-heading text-ink">This screen stopped working</h1>
          <p className="mt-2 text-sm text-muted">Nothing you saved is lost. Go back to Home and carry on from there.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {caught && (
              <Button type="button" icon={RotateCcw} onClick={this.reset}>
                Try again
              </Button>
            )}
            {/* A full page load of Home, not of this address: reloading the screen that crashed would only crash again. */}
            <Button as="a" href="/" variant={caught ? 'outline' : 'primary'} icon={House}>
              Go to Home
            </Button>
            <Button type="button" variant="ghost" icon={RefreshCw} onClick={() => window.location.reload()}>
              Reload
            </Button>
          </div>
          {import.meta.env.DEV && (
            <details className="mt-6 w-full text-start">
              <summary className="cursor-pointer text-sm text-muted">Details for developers</summary>
              <pre className="mt-2 max-h-60 overflow-auto rounded-control bg-sunken p-3 text-xs whitespace-pre-wrap text-body">{details}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
