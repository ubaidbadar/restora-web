import PKT from '../constants/pkt';
import type DateInput from '../types/date_input';

const keyFormat = new Intl.DateTimeFormat('en-CA', { timeZone: PKT, year: 'numeric', month: '2-digit', day: '2-digit' });

/** The PKT calendar day as YYYY-MM-DD. */
const dayKey = (value: DateInput = Date.now()) => keyFormat.format(new Date(value));

export default dayKey;
