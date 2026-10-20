import { Navigate, Outlet } from 'react-router';
import useWorkplace from '../hooks/useWorkplace';

/** Pages inside a restaurant. Without one: pick or create one first. */
export default function RequireRestaurant() {
  return useWorkplace() ? <Outlet /> : <Navigate to="/restaurants" replace />;
}
