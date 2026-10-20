import type Menu from '../../types/menu';

/** What every Menu tab gets: the menu, and a way to change what is on screen after a save. */
export default interface MenuTabProps {
  menu: Menu;
  onUpdate: (part: Partial<Menu>) => void;
}
