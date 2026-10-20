import type DateInput from '../types/date_input';

const minutesSince = (value: DateInput, now = Date.now()) => Math.floor((now - new Date(value).getTime()) / 60_000);

export default minutesSince;
