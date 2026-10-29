import type { ChangeEvent } from 'react';
import { useWatch } from 'react-hook-form';
import { ImagePlus, Store, Trash2 } from 'lucide-react';
import type FormComponentProps from '../types/form_component_props';
import Button from '../ui/button';
import toast from '../utils/toast';

const MAX_BYTES = 1024 * 1024;

/** Longest side of a logo drawn from an SVG: sharp on receipts and retina screens, small to store. */
const SVG_SIZE = 512;

/**
 * An SVG drawn onto a canvas as a PNG data URL. Logos are stored as PNG because an SVG can carry scripts, and email
 * apps such as Gmail do not show SVG images.
 */
const svgToPng = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // An SVG without width and height has no natural size in some browsers: treat it as square.
      const ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(ratio >= 1 ? SVG_SIZE : SVG_SIZE * ratio);
      canvas.height = Math.round(ratio >= 1 ? SVG_SIZE / ratio : SVG_SIZE);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('svg'));
    };
    img.src = url;
  });

/** The restaurant's logo. Picking a file puts it in the form as a data URL; the preview follows the form value. */
export default function LogoField({ control, setValue }: FormComponentProps) {
  const logo: string | undefined = useWatch({ control, name: 'logo' });

  const pick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Pick an image file (PNG, JPG or SVG).');
    if (file.size > MAX_BYTES) return toast.error('The logo must be 1 MB or smaller.');
    if (file.type === 'image/svg+xml') {
      return void svgToPng(file)
        .then((png) => setValue('logo', png, { shouldDirty: true }))
        .catch(() => toast.error('This SVG could not be read. Try a PNG instead.'));
    }
    const reader = new FileReader();
    reader.onload = () => setValue('logo', String(reader.result), { shouldDirty: true });
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid size-20 shrink-0 aspect-square place-items-center overflow-hidden rounded-card border border-border bg-sunken">
        {logo ? <img src={logo} alt="Restaurant logo" className="size-full aspect-square object-cover object-center" /> : <Store size={28} className="text-muted" aria-hidden="true" />}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <Button as="label" variant="outline" icon={ImagePlus} className="cursor-pointer has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus">
            {logo ? 'Change logo' : 'Upload logo'}
            <input type="file" accept="image/*" className="sr-only" onChange={pick} />
          </Button>
          {logo && (
            <Button type="button" variant="ghost" icon={Trash2} onClick={() => setValue('logo', undefined, { shouldDirty: true })}>
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted">Square PNG, JPG or SVG, up to 1 MB. Shown on receipts and in the app.</p>
      </div>
    </div>
  );
}
