import siteUrl from '../constants/site_url';

/** The address a table's QR code opens: the guest menu of that table, on the public site. Printed codes keep it for good. */
const tableLink = (code: string) => `${siteUrl}/t/${code}`;

export default tableLink;
