/** Amounts are whole rupees stored as integers. Change the locale here to change grouping everywhere. */
const LOCALE = 'en-PK';

const rupees = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

const formatRs = (amount: number) => `Rs ${rupees.format(Math.round(amount))}`;

export default formatRs;
