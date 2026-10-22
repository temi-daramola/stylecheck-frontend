const LOCALE = 'en-GB';
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const TIME_OPTIONS = { hour: '2-digit', minute: '2-digit' };
const DATE_OPTIONS = { day: 'numeric', month: 'short', year: 'numeric' };
const LONG_DATE_OPTIONS = { day: 'numeric', month: 'long', year: 'numeric' };

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** "Today, 09:14" / "Yesterday, 14:30" / "10 Jun 2025". */
export const formatRelativeDate = (value, now = new Date()) => {
  const date = new Date(value);
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / MS_PER_DAY);
  const time = date.toLocaleTimeString(LOCALE, TIME_OPTIONS);
  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  return date.toLocaleDateString(LOCALE, DATE_OPTIONS);
};

export const formatLongDate = (value) => new Date(value).toLocaleDateString(LOCALE, LONG_DATE_OPTIONS);
