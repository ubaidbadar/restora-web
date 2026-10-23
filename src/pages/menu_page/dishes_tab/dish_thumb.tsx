import { ImagePlus } from 'lucide-react';
import type MenuItem from '../../../types/menu_item';
import Photo from '../../../components/photo';

/** The dish photo in the list, or an empty square inviting one. */
export default function DishThumb({ dish }: { dish: MenuItem }) {
  return (
    <span className="grid size-14 place-items-center overflow-hidden rounded-small bg-sunken">
      {dish.photo ? <Photo src={dish.photo} sizes={dish.photoSizes} shownAt="56px" className="size-full" /> : <ImagePlus size={20} className="text-subtle" aria-hidden="true" />}
    </span>
  );
}
