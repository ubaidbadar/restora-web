import type BranchScope from '../../../types/branch_scope';
import useWorkplace from '../../../hooks/useWorkplace';

interface BranchSummaryProps {
  scope: BranchScope;
  branchIds: string[];
}

/** "All branches", the branch names (from /me, no request), or a warning when someone has no branch left. */
export default function BranchSummary({ scope, branchIds }: BranchSummaryProps) {
  const branches = useWorkplace()?.branches ?? [];
  if (scope === 'all') return <>All branches</>;
  const names = branchIds.flatMap((id) => branches.find((branch) => branch._id === id)?.name ?? []);
  if (!branchIds.length) return <span className="text-warning-800">No branch</span>;
  return <>{names.length ? names.join(', ') : `${branchIds.length} ${branchIds.length === 1 ? 'branch' : 'branches'}`}</>;
}
