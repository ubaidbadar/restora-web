/** A PKT day and wall-clock time ("2026-03-05", "19:30") as an ISO instant. */
const pktToIso = (day: string, time = '00:00') => new Date(`${day}T${time}:00+05:00`).toISOString();

export default pktToIso;
