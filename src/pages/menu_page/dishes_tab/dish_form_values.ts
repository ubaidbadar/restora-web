import type MenuItem from '../../../types/menu_item';

/** A dish as the edit form starts: prices as text, sizes with their ids so orders keep pointing at them. */
export default function dishFormValues(dish: MenuItem) {
  return {
    name: dish.name,
    categoryId: dish.categoryId,
    photo: dish.photo,
    description: dish.description ?? '',
    sizes: dish.sizes.map((size) => ({ _id: size._id, name: size.name, price: String(size.price) })),
    addonGroupIds: dish.addonGroupIds,
    hidden: dish.hidden,
  };
}
