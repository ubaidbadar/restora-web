import { useState, type ChangeEvent } from 'react';
import { useWatch } from 'react-hook-form';
import { ImagePlus, Trash2 } from 'lucide-react';
import type FormComponentProps from '../../../types/form_component_props';
import Button from '../../../ui/button';
import toast from '../../../utils/toast';
import shrinkImage from '../../../utils/shrink_image';

const MAX_BYTES = 15 * 1024 * 1024;

export default function DishPhotoField({ control, setValue }: FormComponentProps) {
  const photo: string | null | undefined = useWatch({ control, name: 'photo' });
  const [loading, setLoading] = useState(false);

  const pick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Pick an image file (JPEG, PNG or WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error('The photo must be 15 MB or smaller.');
      return;
    }
    setLoading(true);
    try {
      const dataUrl = await shrinkImage(file);
      setValue('photo', dataUrl, { shouldDirty: true });
    } catch {
      toast.error('Could not load that photo. Try a different one.');
    } finally {
      setLoading(false);
    }
  };

  const remove = () => {
    setValue('photo', null, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">Photo (optional)</span>
      <div className="flex items-center gap-4">
        <div className="grid size-20 shrink-0 aspect-square place-items-center overflow-hidden rounded-card border border-border bg-sunken">
          {photo ? (
            <img src={photo} alt="Dish preview" className="size-full aspect-square object-cover object-center" />
          ) : (
            <ImagePlus size={28} className="text-muted" aria-hidden="true" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              as="label"
              variant="outline"
              size="sm"
              icon={ImagePlus}
              disabled={loading}
              aria-busy={loading}
              className="cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus"
            >
              {loading ? 'Processing…' : photo ? 'Change photo' : 'Upload photo'}
              <input type="file" accept="image/*" disabled={loading} className="sr-only" onChange={(e) => void pick(e)} />
            </Button>
            {photo && !loading && (
              <Button type="button" variant="ghost" size="sm" icon={Trash2} onClick={remove}>
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-muted">Guests see it on the QR menu. JPEG, PNG or WebP.</p>
        </div>
      </div>
    </div>
  );
}
