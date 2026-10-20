
/** Column names above the customer list from md up, lined up with CustomerRow's columns. */
export default function CustomerListHeader() {
  return (
    <div aria-hidden="true" className="mb-2 hidden items-center gap-3 px-4 text-xs font-medium text-muted md:flex">
      <span className="w-10 shrink-0" />
      <span className="grid flex-1 grid-cols-[minmax(0,1.4fr)_9rem_minmax(0,1fr)] gap-4">
        <span>Customer</span>
        <span>Phone</span>
        <span>Area</span>
      </span>
      <span className="w-56 shrink-0 text-end">Last order</span>
    </div>
  );
}
