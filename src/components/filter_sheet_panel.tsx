import type { ComponentProps } from 'react';
import type OverlayProps from '../types/overlay_props';
import Modal from '../ui/modal';
import FilterForm from './filter_form';

type FilterSheetPanelProps = OverlayProps & Omit<ComponentProps<typeof FilterForm>, 'close'> & { title: string };

/** A filter on a phone: the app's modal, which is a sheet from the bottom there. */
export default function FilterSheetPanel({ state, open, close, title, ...form }: FilterSheetPanelProps) {
  return (
    <Modal state={state} open={open} close={close} title={title} flush>
      <FilterForm {...form} close={close} />
    </Modal>
  );
}
