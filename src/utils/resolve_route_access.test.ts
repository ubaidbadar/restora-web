import { describe, expect, it } from 'vitest';
import type RouteAccess from '../types/route_access';
import sampleMe from '../test/sample_me';
import resolveRouteAccess from './resolve_route_access';

const resolve = (
  policies: RouteAccess[],
  overrides: Partial<Parameters<typeof resolveRouteAccess>[1]> = {},
) =>
  resolveRouteAccess(policies, {
    me: sampleMe(),
    terminal: false,
    pathname: '/orders',
    search: '',
    ...overrides,
  });

describe('resolveRouteAccess', () => {
  it('waits for auth before redirecting an unauthenticated user to login with a safe return path', () => {
    expect(resolve([{ auth: true }], {
      me: null,
      pathname: '/orders/123',
      search: '?status=open',
    })).toEqual({
      type: 'redirect',
      to: '/login?next=%2Forders%2F123%3Fstatus%3Dopen',
    });
  });

  it('sends a locked terminal to the POS unlock screen', () => {
    expect(resolve([{ auth: true }], { me: null, terminal: true })).toEqual({
      type: 'redirect',
      to: '/pos',
    });
  });

  it('does not add a return URL for the root route', () => {
    expect(resolve([{ auth: true }], { me: null, pathname: '/' })).toEqual({
      type: 'redirect',
      to: '/login',
    });
  });

  it('keeps the account-add exception on login and signup', () => {
    expect(resolve([{ guestOnly: true }], { search: '?add=1&next=%2Forders' })).toEqual({ type: 'allow' });
  });

  it('redirects an already signed-in user away from guest pages using a safe next path', () => {
    expect(resolve([{ guestOnly: true }], { search: '?next=%2Forders' })).toEqual({
      type: 'redirect',
      to: '/orders',
    });
    expect(resolve([{ guestOnly: true }], { search: '?next=%2F%2Fevil.example' })).toEqual({
      type: 'redirect',
      to: '/',
    });
  });

  it('allows guest pages when nobody is signed in', () => {
    expect(resolve([{ guestOnly: true }], { me: null })).toEqual({ type: 'allow' });
  });

  it('restricts web-only routes on POS terminals', () => {
    const me = sampleMe();
    me.mode = 'pos';
    expect(resolve([{ auth: true }, { web: true }], { me })).toEqual({
      type: 'redirect',
      to: '/orders/new',
    });
  });

  it('requires a selected restaurant before entering restaurant routes', () => {
    const me = sampleMe();
    me.workplace = null;
    expect(resolve([{ auth: true }, { restaurant: true }], { me })).toEqual({
      type: 'redirect',
      to: '/restaurants',
    });
  });

  it('sends the primary owner through first-run tax setup', () => {
    const me = sampleMe();
    me.workplace!.settings.taxSet = false;
    expect(resolve([{ auth: true }, { restaurant: true }, { setup: true }], { me })).toEqual({
      type: 'redirect',
      to: '/welcome',
    });
  });

  it('does not block non-owners on first-run owner setup', () => {
    const me = sampleMe();
    me.workplace!.isPrimaryOwner = false;
    me.workplace!.settings.taxSet = false;
    expect(resolve([{ auth: true }, { restaurant: true }, { setup: true }], { me })).toEqual({ type: 'allow' });
  });

  it('preserves nested policy order for the same route', () => {
    const me = sampleMe();
    me.mode = 'pos';
    me.workplace!.settings.taxSet = false;
    expect(resolve([{ auth: true }, { restaurant: true, setup: true }, { web: true }], { me })).toEqual({
      type: 'redirect',
      to: '/welcome',
    });
  });

  it('redirects to a fallback route when a permission is missing', () => {
    const me = sampleMe();
    me.workplace!.permissions = [];
    expect(resolve([{ permission: 'reports:view', permissionRedirect: '/orders' }], { me })).toEqual({
      type: 'redirect',
      to: '/orders',
    });
  });

  it('returns the matched policy index for an in-place forbidden state', () => {
    const me = sampleMe();
    me.workplace!.permissions = [];
    expect(resolve([undefined, { permission: 'orders:view' }], { me })).toEqual({
      type: 'forbidden',
      matchIndex: 1,
    });
  });

  it('allows a route when the workplace grants its permission', () => {
    expect(resolve([{ permission: 'orders:view' }])).toEqual({ type: 'allow' });
  });

  it('allows routes without additional access requirements', () => {
    expect(resolve([])).toEqual({ type: 'allow' });
  });
});
