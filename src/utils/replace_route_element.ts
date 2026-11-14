import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router';

/** Replace only the matched route element, preserving every existing parent layout. */
export default function replaceRouteElement(routeList: RouteObject[], target: RouteObject, element: ReactNode): RouteObject[] {
  let changed = false;

  const next = routeList.map((route) => {
    if (route === target) {
      changed = true;
      return { ...route, element } as RouteObject;
    }

    if ('children' in route && route.children) {
      const children = replaceRouteElement(route.children, target, element);
      if (children !== route.children) {
        changed = true;
        return { ...route, children } as RouteObject;
      }
    }

    return route;
  });

  return changed ? next : routeList;
}
