/**
 * Strict Indian Standard Time (IST) utility module (UTC+05:30)
 */

export const IST_TIMEZONE = 'Asia/Kolkata';
export const IST_OFFSET_MINUTES = 330; // +5 hours and 30 minutes

let serverTimeOffsetMs = 0; // Delta between client machine clock and server/network time

/**
 * Update time offset against a trusted server timestamp (in ms)
 */
export function setServerTimeOffset(serverNowMs) {
  if (serverNowMs && typeof serverNowMs === 'number') {
    serverTimeOffsetMs = serverNowMs - Date.now();
  }
}

/**
 * Get current trusted timestamp taking into account clock skew correction
 */
export function getTrustedNowMs() {
  return Date.now() + serverTimeOffsetMs;
}

/**
 * Get current trusted Date object in IST
 */
export function getNowIST() {
  return new Date(getTrustedNowMs());
}

/**
 * Formats a Date or ISO string into a human-readable IST string:
 * e.g. "30 Oct 2026, 10:00 AM IST"
 */
export function formatIST(dateInput) {
  if (!dateInput) return 'Not set';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return 'Invalid Date';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  }).format(date);
}

/**
 * Formats for concise table / countdown display:
 * e.g. "10:00:15 AM"
 */
export function formatISTTime(dateInput) {
  if (!dateInput) return '--:--:--';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '--:--:--';

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Converts an ISO string into standard YYYY-MM-DDTHH:mm string for datetime-local input,
 * representing the exact IST wall clock time.
 */
export function toDatetimeLocalIST(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';

  // Get IST components
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const partMap = {};
  parts.forEach(p => { partMap[p.type] = p.value; });

  return `${partMap.year}-${partMap.month}-${partMap.day}T${partMap.hour}:${partMap.minute}`;
}

/**
 * Converts a datetime-local input value (e.g. "2026-10-30T10:00") into an ISO string with +05:30 offset
 */
export function fromDatetimeLocalIST(localInputValue) {
  if (!localInputValue) return '';
  // Append seconds and +05:30 offset
  const parts = localInputValue.split('T');
  if (parts.length !== 2) return '';
  return `${parts[0]}T${parts[1]}:00+05:30`;
}

/**
 * Calculate remaining time between trusted now and target ISO time
 */
export function getTimeRemaining(targetIsoString) {
  if (!targetIsoString) {
    return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const targetDate = new Date(targetIsoString);
  const diffMs = targetDate.getTime() - getTrustedNowMs();

  if (diffMs <= 0) {
    return { totalMs: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs: diffMs,
    hours,
    minutes,
    seconds,
    isPast: false
  };
}

/**
 * Determine the current quiz status: 'pre-quiz' | 'active' | 'post-quiz'
 */
export function getQuizStatus(startTimeIso, endTimeIso) {
  if (!startTimeIso || !endTimeIso) return 'pre-quiz';

  const nowMs = getTrustedNowMs();
  const startMs = new Date(startTimeIso).getTime();
  const endMs = new Date(endTimeIso).getTime();

  if (nowMs < startMs) {
    return 'pre-quiz';
  } else if (nowMs >= startMs && nowMs <= endMs) {
    return 'active';
  } else {
    return 'post-quiz';
  }
}
