import ORDER_TYPE_LABELS from '../constants/order_type_labels';
import PAYMENT_LABELS from '../constants/payment_labels';
import useAuthStore from '../store/auth_store';
import type Order from '../types/order';
import formatDate from './format_date';
import formatRs from './format_rs';
import formatTime from './format_time';
import lineDetails from './line_details';

const escape = (text: string) => text.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

/** Amounts in the item table go without "Rs", so the columns stay narrow; the totals below carry it. */
const amount = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

const line = (label: string, value: string, className = '') => `<div class="line ${className}"><span>${label}</span><span>${value}</span></div>`;

const STYLES = `
  * { box-sizing: border-box; }
  body { width: 72mm; margin: 0 auto; padding: 4mm 0 6mm; font: 12px/1.4 system-ui, -apple-system, 'Segoe UI', sans-serif; color: #000; font-variant-numeric: tabular-nums; }
  p { margin: 0; }
  .center { text-align: center; }
  .small { font-size: 10.5px; color: #333; }
  .logo { display: block; max-width: 36mm; max-height: 20mm; margin: 0 auto 2mm; object-fit: contain; filter: grayscale(1); }
  .name { font-size: 16px; font-weight: 700; }
  .head p + p { margin-top: 0.5mm; }
  .rule { margin: 3mm 0; border: 0; border-top: 1px dashed #000; }
  .token { display: flex; align-items: baseline; justify-content: space-between; gap: 3mm; }
  .token b { font-size: 22px; }
  .line { display: flex; align-items: baseline; justify-content: space-between; gap: 3mm; margin-top: 0.5mm; }
  .line span:first-child { color: #333; }
  .line span:last-child { text-align: right; }
  table { width: 100%; border-collapse: collapse; }
  th { padding-bottom: 1mm; border-bottom: 1px solid #000; font-size: 10.5px; font-weight: 600; text-align: left; text-transform: uppercase; letter-spacing: 0.04em; }
  td { padding: 1.5mm 0 0; vertical-align: top; }
  .num { padding-left: 3.5mm; text-align: right; white-space: nowrap; }
  small { display: block; color: #333; font-size: 10.5px; }
  .note { font-style: italic; }
  .totals .line span:first-child { color: #000; }
  .grand { margin-top: 1.5mm; padding-top: 1.5mm; border-top: 2px solid #000; font-size: 16px; font-weight: 700; }
  .totals { position: relative; isolation: isolate; }
  /* A rubber stamp behind the totals, only once the order is paid. */
  .stamp { position: absolute; top: 50%; left: 50%; z-index: -1; padding: 1mm 4mm; border: 3px double #000; border-radius: 2mm; opacity: 0.22; transform: translate(-50%, -50%) rotate(-14deg); text-align: center; text-transform: uppercase; white-space: nowrap; }
  .stamp b { display: block; font-size: 30px; line-height: 1.1; letter-spacing: 0.12em; }
  .stamp span { display: block; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; }
  .footer { margin-top: 3mm; }
  .footer p + p { margin-top: 1mm; }
  .kitchen td { padding-top: 2mm; font-size: 15px; }
  .kitchen small { font-size: 13px; color: #000; }
  .kitchen .qty { width: 10mm; font-weight: 700; }
`;

/**
 * Prints an order on an 80 mm receipt printer through the browser's print dialog: the kitchen slip (what to cook, big,
 * no prices) or the customer's receipt. Optional lines (tax numbers, branch phone, closing line) are left off while empty.
 */
export default function printOrder(order: Order, kind: 'kitchen' | 'receipt') {
  const workplace = useAuthStore.getState().me?.workplace;
  const settings = workplace?.settings;
  const branch = workplace?.branch;
  const receipt = settings?.receipt ?? {};
  const isReceipt = kind === 'receipt';
  const where = [ORDER_TYPE_LABELS[order.type], order.tableName && `Table ${order.tableName}`].filter(Boolean).join(' · ');
  const address = order.type === 'delivery' ? [order.area, order.address].filter(Boolean).join(', ') : '';
  const join = (parts: (string | undefined)[], separator: string) => parts.filter(Boolean).join(separator);

  const header = isReceipt
    ? [
        workplace?.restaurant.logo && `<img class="logo" src="${escape(workplace.restaurant.logo)}" alt="">`,
        `<p class="name">${escape(workplace?.restaurant.name ?? '')}</p>`,
        branch && `<p class="small">${escape(join([branch.name, branch.address, branch.area, branch.city], ', '))}</p>`,
        branch?.phone && `<p class="small">${escape(branch.phone)}</p>`,
        (receipt.ntn || receipt.strn) && `<p class="small">${escape(join([receipt.ntn && `NTN ${receipt.ntn}`, receipt.strn && `STRN ${receipt.strn}`], ' · '))}</p>`,
      ]
    : ['<p class="name">KITCHEN</p>'];

  const details = [
    ['Date', `${formatDate(order.createdAt)}, ${formatTime(order.createdAt)}`],
    order.customer && ['Customer', order.customer.name],
    isReceipt && order.customer?.phone && ['Phone', order.customer.phone],
    address && ['Address', address],
    order.rider && ['Rider', order.rider],
  ]
    .filter((entry): entry is string[] => Boolean(entry))
    .map(([label, value]) => line(label ?? '', escape(value ?? '')))
    .join('');

  const rows = order.items
    .map((item) => {
      const extra = [lineDetails(item) && `<small>${escape(lineDetails(item))}</small>`, item.note && `<small class="note">“${escape(item.note)}”</small>`].filter(Boolean).join('');
      return isReceipt
        ? `<tr><td>${escape(item.name)}${extra}</td><td class="num">${item.qty}</td><td class="num">${amount.format(item.price)}</td><td class="num">${amount.format(item.price * item.qty)}</td></tr>`
        : `<tr><td class="qty">${item.qty}×</td><td>${escape(item.name)}${extra}</td></tr>`;
    })
    .join('');
  const columns = isReceipt ? '<th>Item</th><th class="num">Qty</th><th class="num">Rate</th><th class="num">Amount</th>' : '<th class="qty">Qty</th><th>Item</th>';

  const stamp = order.paymentStatus === 'paid' ? `<div class="stamp" aria-hidden="true"><b>Paid</b>${order.paymentMethod ? `<span>${PAYMENT_LABELS[order.paymentMethod]}</span>` : ''}</div>` : '';
  const printed = new Date().toISOString();
  const totals = isReceipt
    ? `<hr class="rule">
      <div class="totals">
        ${stamp}
        ${line('Subtotal', formatRs(order.subtotal))}
        ${order.discount ? line('Discount', `− ${formatRs(order.discount)}`) : ''}
        ${order.paymentMethod ? line(`Tax (${order.taxRate}%)`, formatRs(order.tax)) : line('Tax', 'Added when paid')}
        ${order.deliveryFee ? line('Delivery', formatRs(order.deliveryFee)) : ''}
        ${order.serviceCharge ? line('Service charge', formatRs(order.serviceCharge)) : ''}
        ${line('Total', formatRs(order.total), 'grand')}
      </div>
      <div class="footer center">
        <p>${escape(receipt.footer || 'Thank you! Please come again.')}</p>
        <p class="small">${escape(join([order.takenBy && `Served by ${order.takenBy}`, `Printed ${formatTime(printed)}`], ' · '))}</p>
      </div>`
    : '';

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Order #${order.dailyToken}</title><style>${STYLES}</style></head>
    <body class="${kind}">
      <div class="head center">${header.filter(Boolean).join('')}</div>
      <hr class="rule">
      <div class="token"><b>#${order.dailyToken}</b><span>${escape(where)}</span></div>
      ${details}
      <hr class="rule">
      <table><thead><tr>${columns}</tr></thead><tbody>${rows}</tbody></table>
      ${totals}
    </body></html>`;

  // A hidden frame rather than a new window: no pop-up blocker, and it works in the installed app.
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.style.cssText = 'position:fixed;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.open();
  doc.write(html);
  doc.close();

  // Print once the logo has loaded (or failed), so it is never missing from the paper.
  const images = Array.from(doc.images).map((img) =>
    img.complete
      ? null
      : new Promise((done) => {
          img.addEventListener('load', done);
          img.addEventListener('error', done);
        }),
  );
  void Promise.all(images).then(() => {
    // The page is exactly as long as the slip: a roll printer then cuts right after it, and "Save as PDF" has no blank page.
    // (A length must be given here: "size: 80mm auto" is not valid CSS, so browsers drop it and fall back to A4.)
    const heightMm = Math.ceil((doc.documentElement.scrollHeight * 25.4) / 96);
    const page = doc.createElement('style');
    page.textContent = `@page { size: 80mm ${heightMm}mm; margin: 0; }`;
    doc.head.appendChild(page);
    frame.contentWindow!.addEventListener('afterprint', () => frame.remove());
    frame.contentWindow!.print();
  });
}
