/** The address a table's QR code opens: the guest menu of that table, on this app's own domain. */
const tableLink = (code: string) => `${window.location.origin}/t/${code}`;

export default tableLink;
