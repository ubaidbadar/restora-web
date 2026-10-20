import { Navigate, Outlet } from 'react-router';
import useWorkplace from '../hooks/useWorkplace';

/** The owner finishes the first-run setup (tax, then menu) before using the app. Everyone else goes straight in. */
export default function RequireSetup() {
  const workplace = useWorkplace();
  if (workplace?.isPrimaryOwner && !workplace.settings.taxSet) return <Navigate to="/welcome" replace />;
  return <Outlet />;
}
