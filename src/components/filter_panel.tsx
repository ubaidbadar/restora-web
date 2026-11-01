import type { ComponentProps } from 'react';
import useBreakpoint from '../hooks/useBreakpoint';
import FilterPopoverPanel from './filter_popover_panel';
import FilterSheetPanel from './filter_sheet_panel';

/** A filter's form: a sheet from the bottom on a phone, a panel under its button from `sm` (a small tablet) up. */
export default function FilterPanel({ anchorId, ...props }: ComponentProps<typeof FilterPopoverPanel>) {
  const { sm } = useBreakpoint();
  return sm ? <FilterPopoverPanel anchorId={anchorId} {...props} /> : <FilterSheetPanel {...props} />;
}
