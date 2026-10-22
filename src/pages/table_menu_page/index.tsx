import { useEffect } from 'react';
import { useParams } from 'react-router';
import tableLink from '../../utils/table_link';

/** QR codes printed while the guest menu lived in this app still work: the guest is sent on to the public site. */
export default function TableMenuPage() {
  const { code = '' } = useParams<{ code: string }>();
  useEffect(() => window.location.replace(tableLink(code)), [code]);
  return null;
}
