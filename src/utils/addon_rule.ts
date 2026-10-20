import type AddonGroup from '../types/addon_group';

/** How many options of a group can be picked, in words: "Pick 1", "Optional, up to 3", "Pick 1 to 2". */
export default function addonRule({ min, max }: Pick<AddonGroup, 'min' | 'max'>) {
  if (min === 0) return max === 1 ? 'Optional, pick 1' : `Optional, up to ${max}`;
  if (min === max) return `Pick ${min}`;
  return `Pick ${min} to ${max}`;
}
