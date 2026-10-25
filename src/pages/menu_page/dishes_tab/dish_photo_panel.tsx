import { ImagePlus, Trash2 } from 'lucide-react';
import { type ChangeEvent } from 'react';
import type MenuItem from '../../../types/menu_item';
import type OverlayProps from '../../../types/overlay_props';
import Button from '../../../ui/button';
import Modal from '../../../ui/modal';
import api from '../../../config/api';
import getAxiosMessage from '../../../utils/get_axios_message';
import toast from '../../../utils/toast';
import Photo from '../../../components/photo';
import shrinkImage from '../../../utils/shrink_image';

interface DishPhotoPanelProps extends OverlayProps {
  dish: MenuItem;
  onSaved: (dish: MenuItem) => void;
}

/** The dish's photo, shown on the QR menu. The server stores the picked photo and answers with the dish. */
export default function DishPhotoPanel({ dish, onSaved, ...overlay }: DishPhotoPanelProps) {
  const savePhoto = (photo: string | null) =>
    api
      .patch(`/menu/items/${dish._id}`, { photo })
      .then((res) => onSaved(res.data))
      .catch((err) => toast.error(getAxiosMessage(err)));
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) savePhoto(await shrinkImage(file));
  };

  return (
    <Modal {...overlay} title={`${dish.name} photo`}>
      <div className="grid aspect-4/3 place-items-center overflow-hidden rounded-card bg-sunken">
        {dish.photo ? <Photo src={dish.photo} sizes={dish.photoSizes} shownAt="(min-width: 32rem) 28rem, 100vw" alt={dish.name} className="size-full" /> : <ImagePlus size={36} className="text-muted" aria-hidden="true" />}
      </div>
      <p className="text-sm text-muted">Guests see it on the QR menu. A square or landscape photo with the dish in the middle works best.</p>
      <div className="flex flex-wrap gap-2">
        <Button as="label" size="lg" icon={ImagePlus} className="cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
          {dish.photo ? 'Change photo' : 'Upload photo'}
          <input type="file" accept="image/*" className="sr-only" onChange={(event) => void upload(event)} />
        </Button>
        {dish.photo && (
          <Button variant="ghost" size="lg" icon={Trash2} onClick={() => savePhoto(null)}>
            Remove
          </Button>
        )}
      </div>
    </Modal>
  );
}
