import { ImagePlus } from 'lucide-react';
import type MenuItem from '../../../types/menu_item';

/** The dish photo in the list, or an empty square inviting one. */
export default function DishThumb({ dish }: { dish: MenuItem }) {
  return (
    <span className="grid size-14 place-items-center overflow-hidden rounded-small bg-sunken">
      {dish.photo ? <img src={dish.photo} alt="" loading="lazy" className="size-full object-cover" /> : <ImagePlus size={20} className="text-subtle" aria-hidden="true" />}
    </span>
  );
}
