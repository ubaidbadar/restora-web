import PERMISSION_CATALOG from '@shared/permission_catalog';
import type FormComponentProps from '../../../types/form_component_props';
import Checkbox from '../../../ui/checkbox';

const GROUPS = [...new Set(PERMISSION_CATALOG.map((entry) => entry.group))];

/** A new role's permissions, grouped as an owner thinks of them. */
export default function PermissionChecks({ register }: Pick<FormComponentProps, 'register'>) {
  return (
    <>
      {GROUPS.map((group) => (
        <fieldset key={group} className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-semibold text-ink">{group}</legend>
          {PERMISSION_CATALOG.filter((entry) => entry.group === group).map((entry) => (
            <Checkbox
              key={entry.permission}
              label={entry.label}
              value={entry.permission}
              {...register('permissions')}
            />
          ))}
        </fieldset>
      ))}
    </>
  );
}
