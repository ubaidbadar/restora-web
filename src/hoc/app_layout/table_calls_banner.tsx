import { useLocation } from 'react-router';
import TableCallsLink from './table_calls_link';

/** Guest calls waiting, at the top of every page. Not on the Tables page, which shows (and loads) the calls itself. */
export default function TableCallsBanner() {
  const { pathname } = useLocation();
  return pathname === '/tables' ? null : <TableCallsLink />;
}
