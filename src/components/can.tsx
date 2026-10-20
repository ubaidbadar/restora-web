import type { ReactNode } from 'react';
import type Permission from '@shared/permission';
import useCan from '../hooks/useCan';

interface CanProps {
  permission: Permission;
  children: ReactNode;
}

/** Shows its children only to people with the permission. */
export default function Can({ permission, children }: CanProps) {
  return useCan(permission) ? <>{children}</> : null;
}
