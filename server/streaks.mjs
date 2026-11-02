const DAY = 86400000;
export const streakMilestones = [3, 7, 14, 30, 60, 100];
function zone(value) {
  try {
    if (typeof value === 'string' && value.length <= 80) {
      new Intl.DateTimeFormat('en', { timeZone: value }).format();
      return value;
    }
  } catch {}
  return null;
}
function dateKey(now, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(new Date(now))
      .map((p) => [p.type, p.value])
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}
const ordinal = (key) => Date.parse(key + 'T00:00:00Z') / DAY;
const keyFor = (day) => new Date(day * DAY).toISOString().slice(0, 10);
function validKey(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(ordinal(value)) &&
    keyFor(ordinal(value)) === value
  );
}
export function practiceStreak(user, { now = Date.now(), timeZoneHint } = {}) {
  const metadata = user?.user_metadata || {};
  const timeZone = zone(metadata.bb_streak_timezone) || zone(timeZoneHint) || 'UTC';
  const today = dateKey(now, timeZone),
    day = ordinal(today);
  const days = [
    ...new Set(
      Array.isArray(metadata.bb_practice_days)
        ? metadata.bb_practice_days.filter((d) => validKey(d) && d <= today)
        : []
    ),
  ].sort();
  const active = new Set(days);
  let longest = 0,
    run = 0,
    previous = -Infinity;
  for (const date of days) {
    const index = ordinal(date);
    run = index === previous + 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = index;
  }
  const activeToday = active.has(today);
  let current = 0,
    cursor = activeToday ? day : day - 1;
  while (active.has(keyFor(cursor))) {
    current++;
    cursor--;
  }
  const weekday = new Date(day * DAY).getUTCDay();
  const monday = day - ((weekday + 6) % 7);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = keyFor(monday + i),
      stamp = new Date((monday + i) * DAY);
    return {
      date,
      label: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
      fullLabel: new Intl.DateTimeFormat('en', {
        timeZone: 'UTC',
        weekday: 'long',
        month: 'short',
        day: 'numeric',
      }).format(stamp),
      active: active.has(date),
      isToday: date === today,
      future: date > today,
    };
  });
  return {
    current,
    longest,
    totalDays: days.length,
    activeToday,
    today,
    timeZone,
    week,
    nextMilestone:
      streakMilestones.find((n) => n > current) || (Math.floor(current / 100) + 1) * 100,
    earnedMilestones: streakMilestones.filter((n) => n <= longest),
  };
}
export function recordPracticeDay(user, options = {}) {
  const streak = practiceStreak(user, options);
  const existing = user?.user_metadata?.bb_practice_days;
  const days = [
    ...new Set([
      ...(Array.isArray(existing) ? existing.filter((d) => validKey(d) && d <= streak.today) : []),
      streak.today,
    ]),
  ].sort();
  return { bb_practice_days: days, bb_streak_timezone: streak.timeZone };
}
