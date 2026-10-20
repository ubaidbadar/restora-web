import { useLocation } from 'react-router';
import TableCallsLink from './table_calls_link';

/** "2 guest calls" floating above the page. Not on the Tables page, which shows (and loads) the calls itself. */
export default function TableCallsPill() {
  const { pathname } = useLocation();
  return pathname === '/tables' ? null : <TableCallsLink />;
}
