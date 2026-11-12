import NavItem from '../../components/nav_item';
import ListRow from '../../ui/list_row';
import type SETTINGS_SECTIONS from './settings_sections';

interface SettingsNavProps {
  sections: typeof SETTINGS_SECTIONS;
  /** A phone's list of sections (rows with a chevron) instead of the desktop's column beside the open one. */
  list?: boolean;
}

/** The settings sections by group: a column beside the open section on a desktop, or the whole page on a phone. */
export default function SettingsNav({ sections, list = false }: SettingsNavProps) {
  const groups = [...new Set(sections.map((section) => section.group))];

  return (
    <nav aria-label="Settings" className={list ? 'flex flex-col gap-5' : 'sticky top-6 flex w-56 shrink-0 flex-col gap-4 self-start'}>
      {groups.map((group) => (
        <section key={group} aria-label={group} className="flex flex-col gap-1.5">
          <h2 className="px-3 text-xs font-semibold tracking-wide text-muted uppercase">{group}</h2>
          <ul className={list ? 'divide-y divide-border overflow-hidden rounded-card bg-surface shadow-card' : 'flex flex-col gap-0.5'}>
            {sections
              .filter((section) => section.group === group && section.value !== 'whatsapp')
              .map((section) =>
                list ? (
                  <ListRow key={section.value} to={`/settings/${section.value}`} leading={<section.icon aria-hidden className="size-5" />} title={section.label} />
                ) : (
                  <li key={section.value}>
                    <NavItem to={`/settings/${section.value}`} label={section.label} icon={section.icon} />
                  </li>
                )
              )}
          </ul>
        </section>
      ))}
    </nav>
  );
}
