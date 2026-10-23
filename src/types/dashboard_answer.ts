import type Branch from './branch';
import type Customer from './customer';
import type DashboardStats from './dashboard_stats';

/** What `GET /dashboard` answers. */
export default interface DashboardAnswer {
  stats: DashboardStats;
  /** Filled only for "All branches". */
  perBranch: { branch: Branch; sales: number; orderCount: number; cancelledCount?: number }[];
  /** The top customers who have not ordered for 30 days. */
  slipping: Customer[];
  slippingTotal: number;
}
