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

interface DishPhotoPanelProps extends OverlayProps {
  dish: MenuItem;
  onSaved: (dish: MenuItem) => void;
}

/** A phone photo made small enough to upload quickly: at most `size` pixels on its longer side (the largest size the server keeps), as a JPEG data URL. */
async function shrinkImage(file: File, size = 1200): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, size / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.85);
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
      <div className="flex flex-col gap-4">
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
      </div>
    </Modal>
  );
}
