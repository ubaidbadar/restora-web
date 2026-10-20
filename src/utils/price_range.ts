import type MenuSize from '../types/menu_size';
import formatRs from './format_rs';

/** "Rs 450", or "Rs 1,250–2,300" for a dish with sizes. */
export default function priceRange(sizes: MenuSize[]) {
  const prices = sizes.map((size) => size.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  return low === high ? formatRs(low) : `${formatRs(low)}–${formatRs(high).replace(/^Rs\s?/, '')}`;
}
