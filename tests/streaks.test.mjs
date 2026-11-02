import { test } from 'node:test';
import assert from 'node:assert/strict';
import { practiceStreak, recordPracticeDay } from '../server/streaks.mjs';
const now = Date.parse('2026-11-02T12:00:00Z');
const user = (days, timezone = 'Asia/Singapore') => ({
  user_metadata: { bb_practice_days: days, bb_streak_timezone: timezone },
});
test('a new streak has no invented activity and a Monday-to-Sunday calendar', () => {
  const state = practiceStreak(null, { now, timeZoneHint: 'Asia/Singapore' });
  assert.equal(state.current, 0);
  assert.equal(state.longest, 0);
  assert.equal(state.totalDays, 0);
  assert.equal(state.week[0].date, '2026-11-02');
  assert.equal(state.week[6].date, '2026-11-08');
  assert.equal(state.week[0].isToday, true);
  assert.equal(state.week[1].future, true);
});
test('successful replays count once per calendar day and keep the first account timezone', () => {
  const first = recordPracticeDay({}, { now, timeZoneHint: 'Asia/Singapore' });
  const second = recordPracticeDay(
    { user_metadata: first },
    { now, timeZoneHint: 'America/New_York' }
  );
  assert.deepEqual(second.bb_practice_days, ['2026-11-02']);
  assert.equal(second.bb_streak_timezone, 'Asia/Singapore');
  const state = practiceStreak({ user_metadata: second }, { now });
  assert.equal(state.current, 1);
  assert.equal(state.activeToday, true);
});
test('yesterday keeps a streak alive until midnight; a missed day resets only the current streak', () => {
  const profile = user(['2026-10-30', '2026-10-31', '2026-11-01']);
  const pending = practiceStreak(profile, { now });
  assert.equal(pending.current, 3);
  assert.equal(pending.activeToday, false);
  assert.equal(pending.nextMilestone, 7);
  const missed = practiceStreak(profile, { now: now + 86400000 });
  assert.equal(missed.current, 0);
  assert.equal(missed.longest, 3);
  assert.deepEqual(missed.earnedMilestones, [3]);
  assert.equal(missed.totalDays, 3);
});
test('invalid, duplicate, malformed and future activity cannot inflate the calendar', () => {
  const state = practiceStreak(
    user(['2026-11-02', '2026-11-02', '2026-02-30', '2030-12-31', null, {}, 'not-a-date']),
    { now }
  );
  assert.equal(state.totalDays, 1);
  assert.equal(state.current, 1);
  assert.equal(state.week.filter((d) => d.active).length, 1);
  assert.equal(practiceStreak(user('not-an-array', 'bad/timezone'), { now }).timeZone, 'UTC');
});
test('local midnight and daylight-saving changes use calendar dates rather than elapsed hours', () => {
  assert.equal(
    practiceStreak({}, { now: Date.parse('2026-11-02T16:00:00Z'), timeZoneHint: 'Asia/Singapore' })
      .today,
    '2026-11-03'
  );
  assert.equal(
    practiceStreak({}, { now: Date.parse('2026-11-02T15:59:59Z'), timeZoneHint: 'Asia/Singapore' })
      .today,
    '2026-11-02'
  );
  const state = practiceStreak(
    user(['2026-10-31', '2026-11-01', '2026-11-02'], 'America/New_York'),
    { now: Date.parse('2026-11-02T17:00:00Z') }
  );
  assert.equal(state.current, 3);
});
test('best streak crosses month/year boundaries, and all milestones can be earned', () => {
  const days = Array.from({ length: 102 }, (_, i) =>
    new Date(Date.parse('2026-11-02T00:00:00Z') - i * 86400000).toISOString().slice(0, 10)
  );
  const state = practiceStreak(user(days), { now });
  assert.equal(state.current, 102);
  assert.equal(state.longest, 102);
  assert.equal(state.nextMilestone, 200);
  assert.deepEqual(state.earnedMilestones, [3, 7, 14, 30, 60, 100]);
  assert.equal(
    practiceStreak(user(['2025-12-31', '2026-01-01']), { now: Date.parse('2026-01-01T12:00Z') })
      .current,
    2
  );
});
