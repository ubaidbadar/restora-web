import { describe, expect, it } from 'vitest';
import type { RouteObject } from 'react-router';
import replaceRouteElement from './replace_route_element';

describe('replaceRouteElement', () => {
  it('replaces a denied child route while preserving its parent layout and siblings', () => {
    const sibling: RouteObject = { path: 'orders', element: <main /> };
    const denied: RouteObject = { path: 'settings', element: <section /> };
    const parent: RouteObject = {
      element: <div />,
      children: [sibling, denied],
    };
    const routes: RouteObject[] = [parent];
    const fallback = <p>Not allowed</p>;

    const updated = replaceRouteElement(routes, denied, fallback);
    const updatedParent = updated[0] as RouteObject & { children: RouteObject[]; element: React.ReactNode };

    expect(updated).not.toBe(routes);
    expect(updatedParent.element).toBe(parent.element);
    expect(updatedParent.children[0]).toBe(sibling);
    expect(updatedParent.children[1]).not.toBe(denied);
    expect(updatedParent.children[1]).toMatchObject({ path: 'settings', element: fallback });
  });

  it('replaces a pathless permission group so its denied children cannot render', () => {
    const deniedGroup: RouteObject = {
      children: [{ path: 'orders', element: <main /> }],
    };
    const routes: RouteObject[] = [deniedGroup];
    const fallback = <p>Not allowed</p>;

    const updated = replaceRouteElement(routes, deniedGroup, fallback);

    expect(updated[0]).toMatchObject({ element: fallback });
    expect((updated[0] as RouteObject & { children: RouteObject[] }).children).toBe(deniedGroup.children);
  });

  it('returns the original route tree when the target is not part of it', () => {
    const routes: RouteObject[] = [{ path: 'orders', element: <main /> }];

    expect(replaceRouteElement(routes, { path: 'settings' }, <p>Not allowed</p>)).toBe(routes);
  });
});
