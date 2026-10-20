import type AddonOption from './addon_option';

/** Extras or choices shared by many dishes. `min` 0 = optional; `max` 1 = pick one. */
export default interface AddonGroup {
  _id: string;
  name: string;
  min: number;
  max: number;
  options: AddonOption[];
}
