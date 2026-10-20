import type { ReactNode } from 'react';
import type ShowTools from './show_tools';

/** Renders the element that opens the overlay: `component={({ open }) => <Button onClick={open} />}`. */
type OverlayTrigger = (tools: ShowTools) => ReactNode;

export default OverlayTrigger;
