import PKT from '../constants/pkt';
import type DateInput from '../types/date_input';

const timeFormat = new Intl.DateTimeFormat('en-PK', { timeZone: PKT, hour: 'numeric', minute: '2-digit', hour12: true });

/** "7:05 pm" */
const formatTime = (value: DateInput) => timeFormat.format(new Date(value)).toLowerCase();

export default formatTime;
