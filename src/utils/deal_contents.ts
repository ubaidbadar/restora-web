import type MenuItem from '../types/menu_item';

/** "Chicken Karahi (Half), 2× Naan": what is in a deal, by the dishes' names on the menu; '' for a dish. */
export default function dealContents(deal: Pick<MenuItem, 'includes'>, items: MenuItem[]): string {
  return (deal.includes ?? [])
    .map((part) => {
      const dish = items.find((item) => item._id === part.itemId);
      const size = dish?.sizes.find((entry) => entry._id === part.sizeId)?.name;
      return `${part.qty > 1 ? `${part.qty}× ` : ''}${dish?.name ?? 'A removed dish'}${size ? ` (${size})` : ''}`;
    })
    .join(', ');
}
