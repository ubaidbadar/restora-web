import PKT from '../constants/pkt';
import type DateInput from '../types/date_input';

const dateFormat = new Intl.DateTimeFormat('en-GB', { timeZone: PKT, day: 'numeric', month: 'short', year: 'numeric' });

/** "5 Mar 2026" */
const formatDate = (value: DateInput) => dateFormat.format(new Date(value));

export default formatDate;
