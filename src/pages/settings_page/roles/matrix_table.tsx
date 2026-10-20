import { Fragment } from 'react';
import PERMISSION_CATALOG from '@shared/permission_catalog';
import type FormComponentProps from '../../../types/form_component_props';
import type Role from '../../../types/role';
import SaveBar from '../save_bar';
import MatrixCell from './matrix_cell';
import RoleHeader from './role_header';

interface MatrixTableProps {
  form: FormComponentProps;
  roles: Role[];
  onRoleSaved: (role: Role) => void;
  onRoleDeleted: (id: string) => void;
}

const GROUPS = [...new Set(PERMISSION_CATALOG.map((entry) => entry.group))];

/** Rows: permissions by group. Columns: roles. Scrolls sideways on a phone, the permission names stay readable. */
export default function MatrixTable({ form, roles, onRoleSaved, onRoleDeleted }: MatrixTableProps) {
  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-max border-collapse text-sm">
          <caption className="sr-only">What each role may do</caption>
          <thead>
            <tr className="border-b border-border">
              <th scope="col" className="sticky inset-s-0 z-10 bg-surface px-5 py-3 text-start font-semibold text-ink sm:px-6">Permission</th>
              {roles.map((role) => (
                <th key={role._id} scope="col" className="px-3 py-3 align-bottom font-normal">
                  <RoleHeader role={role} onSaved={onRoleSaved} onDeleted={onRoleDeleted} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((group) => (
              <Fragment key={group}>
                <tr>
                  <th colSpan={roles.length + 1} scope="colgroup" className="bg-sunken px-5 py-2 text-start text-xs font-semibold tracking-wide text-muted uppercase sm:px-6">
                    {group}
                  </th>
                </tr>
                {PERMISSION_CATALOG.filter((entry) => entry.group === group).map((entry) => (
                  <tr key={entry.permission} className="border-b border-border last:border-0">
                    <th scope="row" className="sticky inset-s-0 z-10 max-w-36 bg-surface px-4 py-2 text-start text-xs font-normal text-body sm:max-w-64 sm:px-6 sm:text-sm">
                      {entry.label}
                    </th>
                    {roles.map((role) => (
                      <td key={role._id} className="px-3 py-2 text-center">
                        <MatrixCell role={role} permission={entry.permission} label={entry.label} register={form.register} />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <footer className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center justify-end gap-3 rounded-b-card border-t border-border bg-surface px-5 py-3 sm:px-6 lg:bottom-0">
        <SaveBar control={form.control} loading={form.loading} />
      </footer>
    </>
  );
}
