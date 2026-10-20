import { Lock } from 'lucide-react';
import { Navigate, Outlet } from 'react-router';
import type Permission from '@shared/permission';
import EmptyState from '../components/empty_state';
import useCan from '../hooks/useCan';

interface RequirePermissionProps {
  permission: Permission;
  /** Go here instead of showing "not allowed" (e.g. Home → Orders for people who can't see the numbers). */
  redirect?: string;
}

/** A page for people with the permission. */
export default function RequirePermission({ permission, redirect }: RequirePermissionProps) {
  if (useCan(permission)) return <Outlet />;
  if (redirect) return <Navigate to={redirect} replace />;
  return <EmptyState icon={Lock} titleAs="h1" title="Not for your role" text="Ask the owner or a manager if you need this page." />;
}
