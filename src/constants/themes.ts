import type RestaurantSettings from '@shared/restaurant_settings';

type ThemeName = NonNullable<RestaurantSettings['appearance']>['theme'];

/** The themes a restaurant can pick (Settings → Appearance), in the order shown. Their colours are in src/index.css. */
const THEMES: { value: ThemeName; label: string; mood: string }[] = [
  { value: 'indigo', label: 'Midnight Indigo', mood: 'Classic' },
  { value: 'saffron', label: 'Saffron', mood: 'Warm' },
  { value: 'emerald', label: 'Emerald', mood: 'Fresh' },
  { value: 'ocean', label: 'Ocean', mood: 'Calm' },
  { value: 'bordeaux', label: 'Bordeaux', mood: 'Fine dining' },
  { value: 'onyx', label: 'Onyx & Gold', mood: 'Luxury' },
];

export default THEMES;
