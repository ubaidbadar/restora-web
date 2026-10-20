import PKT from '../constants/pkt';
import type DateInput from '../types/date_input';

const dayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: PKT, weekday: 'short', day: 'numeric', month: 'short' });

/** "Thu, 5 Mar" */
const formatDay = (value: DateInput) => dayFormat.format(new Date(value));

export default formatDay;
