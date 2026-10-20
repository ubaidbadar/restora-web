import type AddonGroup from '../../../types/addon_group';
import Pill from '../../../ui/pill';
import formatRs from '../../../utils/format_rs';

interface AddonChoicesProps {
  group: AddonGroup;
  /** Every picked option id of the dish (all groups). */
  picked: string[];
  onChange: (picked: string[]) => void;
}

/** The options of one add-on group as chips. A pick-one group swaps its choice; others toggle up to the group's maximum. */
export default function AddonChoices({ group, picked, onChange }: AddonChoicesProps) {
  const own = group.options.map((option) => option._id);
  const chosen = picked.filter((id) => own.includes(id));

  const toggle = (id: string) => {
    if (chosen.includes(id)) return onChange(picked.filter((entry) => entry !== id));
    if (group.max === 1) return onChange([...picked.filter((entry) => !own.includes(entry)), id]);
    if (chosen.length < group.max) onChange([...picked, id]);
  };

  return (
    <div role="group" aria-label={group.name} className="-mx-1 flex flex-wrap gap-2 p-1">
      {group.options.map((option) => (
        <Pill key={option._id} isActive={chosen.includes(option._id)} onClick={() => toggle(option._id)} className="min-h-11 px-3.5! text-sm! lg:min-h-10">
          {option.name}
          {option.price > 0 && <span className="ms-1.5 tabular-nums opacity-80">+{formatRs(option.price)}</span>}
        </Pill>
      ))}
    </div>
  );
}
