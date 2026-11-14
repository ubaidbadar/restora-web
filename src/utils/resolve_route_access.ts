import type Me from '@shared/me';
import can from '@shared/can';
import type RouteAccess from '../types/route_access';
import safeNext from './safe_next';

type RouteAccessDecision =
  | { type: 'allow' }
  | { type: 'redirect'; to: string }
  | { type: 'forbidden'; matchIndex: number };

interface RouteContext {
  me: Me | null | undefined;
  terminal: boolean;
  pathname: string;
  search: string;
}

/**
 * Resolve route metadata in match order. This mirrors the old nested guard order while keeping
 * every decision in App and avoiding one auth/workplace subscription per guard.
 */
export default function resolveRouteAccess(
  policies: readonly (RouteAccess | undefined)[],
  { me, terminal, pathname, search }: RouteContext,
): RouteAccessDecision {
  const params = new URLSearchParams(search);

  for (const [matchIndex, policy] of policies.entries()) {
    if (!policy) continue;

    if (policy.guestOnly && me && params.get('add') !== '1') {
      return { type: 'redirect', to: safeNext(params.get('next')) };
    }

    if (policy.auth && !me) {
      if (terminal) return { type: 'redirect', to: '/pos' };
      const next = `${pathname}${search}`;
      return { type: 'redirect', to: next === '/' ? '/login' : `/login?next=${encodeURIComponent(next)}` };
    }

    if (policy.web && me?.mode === 'pos') {
      return { type: 'redirect', to: '/orders/new' };
    }

    if (policy.restaurant && !me?.workplace) {
      return { type: 'redirect', to: '/restaurants' };
    }

    if (policy.setup && me?.workplace?.isPrimaryOwner && !me.workplace.settings.taxSet) {
      return { type: 'redirect', to: '/welcome' };
    }

    if (policy.permission && !can(me?.workplace, policy.permission)) {
      return policy.permissionRedirect
        ? { type: 'redirect', to: policy.permissionRedirect }
        : { type: 'forbidden', matchIndex };
    }
  }

  return { type: 'allow' };
}
