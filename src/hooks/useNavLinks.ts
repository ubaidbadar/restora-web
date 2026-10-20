import can from '@shared/can';
import NAV_LINKS from '../constants/nav_links';
import useAuthStore from '../store/auth_store';

/** The pages this person may open here: `main` for the phone's bottom bar (three), `more` for the rest. */
export default function useNavLinks() {
  const me = useAuthStore((state) => state.me);
  const links = NAV_LINKS.filter(
    (link) => (!link.permission || can(me?.workplace, link.permission)) && (!link.webOnly || me?.mode === 'web')
  );
  return { main: links.slice(0, 3), more: links.slice(3) };
}
