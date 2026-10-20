import useWorkplace from '../../../hooks/useWorkplace';

/** A branch's name from its id, from the branches in /me (no request). */
export default function BranchName({ id }: { id: string }) {
  const branch = useWorkplace()?.branches.find((candidate) => candidate._id === id);
  return <>{branch?.name ?? 'Archived branch'}</>;
}
