import type MenuItem from '../../../types/menu_item';

/** A deal as the edit form starts: its one price as text, and its size's id so orders keep pointing at it. */
export default function dealFormValues(deal: MenuItem) {
  return {
    name: deal.name,
    categoryId: deal.categoryId,
    photo: deal.photo,
    description: deal.description ?? '',
    sizeId: deal.sizes[0]?._id,
    price: String(deal.sizes[0]?.price ?? ''),
    includes: deal.includes.map((part) => ({ itemId: part.itemId, sizeId: part.sizeId ?? '', qty: String(part.qty) })),
    addonGroupIds: deal.addonGroupIds,
    days: deal.days.map(String),
    from: deal.from,
    to: deal.to,
    hidden: deal.hidden,
  };
}
