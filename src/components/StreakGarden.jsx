import React, { useEffect, useState } from 'react';
import { Link } from '../routing';
import { Icon } from './Interface';
const milestones = [
  [3, 'Little sprout'],
  [7, 'Honey week'],
  [14, 'Busy little bee'],
  [30, 'Boulevard bloom'],
  [60, 'Golden garden'],
  [100, 'Queen of curiosity'],
];
function Flower({ active, today, index }) {
  return (
    <svg
      viewBox="0 0 84 116"
      aria-hidden="true"
      className="streak-flower"
      style={{ '--sway-delay': `${index * -0.37}s` }}
    >
      <ellipse cx="42" cy="108" rx="23" ry="5" fill="#060f1e" opacity=".5" />
      <path
        d="M42 105Q38 82 43 55"
        fill="none"
        stroke={active ? '#79b59b' : '#395c56'}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M41 92Q20 92 22 76Q40 75 41 92M42 83Q61 84 63 68Q43 67 42 83"
        fill={active ? '#5c9c78' : '#29483e'}
      />
      <g className={active ? 'streak-petals is-bloomed' : 'streak-petals'}>
        {active ? (
          <>
            {Array.from({ length: 6 }, (_, i) => (
              <ellipse
                key={i}
                cx="42"
                cy="31"
                rx="11"
                ry="17"
                transform={`rotate(${i * 60} 42 48)`}
                fill={index % 2 ? '#f2a05f' : '#efbd65'}
                stroke="#ffd99a"
                strokeWidth="1.5"
              />
            ))}
            <circle cx="42" cy="48" r="16" fill="#ffe5a1" />
            <ellipse cx="37" cy="47" rx="1.6" ry="2.4" fill="#70442d" />
            <ellipse cx="47" cy="47" rx="1.6" ry="2.4" fill="#70442d" />
            <path
              d="M39 53q3 3 6 0"
              fill="none"
              stroke="#70442d"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <ellipse cx="32" cy="52" rx="3" ry="1.8" fill="#ef9a79" />
            <ellipse cx="52" cy="52" rx="3" ry="1.8" fill="#ef9a79" />
          </>
        ) : (
          <>
            <path
              d="M42 65C23 59 26 40 42 32C58 40 61 59 42 65Z"
              fill={today ? '#c3915e' : '#486d64'}
              stroke={today ? '#e7b783' : '#668b7b'}
              strokeWidth="2"
            />
            <path
              d="M42 64Q39 49 42 37"
              fill="none"
              stroke={today ? '#f1cd95' : '#86a28a'}
              strokeWidth="1.5"
            />
          </>
        )}
      </g>
      {today && <path d="m69 19 2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#ffd99a" />}
    </svg>
  );
}
export default function StreakGarden({ streak, loading, nextLab }) {
  const [selected, setSelected] = useState(null),
    [badge, setBadge] = useState(3);
  const [cheer, setCheer] = useState(false);
  useEffect(() => {
    if (!cheer) return;
    const timer = setTimeout(() => setCheer(false), 2400);
    return () => clearTimeout(timer);
  }, [cheer]);
  if (loading)
    return (
      <section className="streak-garden is-loading" aria-label="Daily streak">
        <div>
          <span className="bb-eyebrow">HONEY’S STREAK GARDEN</span>
          <h2>Waking up your little garden…</h2>
          <p role="status">Loading your saved practice days.</p>
        </div>
        <Icon name="spark" size={28} />
      </section>
    );
  if (!streak)
    return (
      <section className="streak-garden is-loading">
        <div>
          <span className="bb-eyebrow">HONEY’S STREAK GARDEN</span>
          <h2>Your garden will be here.</h2>
          <p>Your daily activity couldn’t be loaded. Refresh your progress to try again.</p>
        </div>
        <Icon name="spark" size={28} />
      </section>
    );
  const {
    current,
    longest,
    totalDays,
    activeToday,
    week,
    nextMilestone,
    earnedMilestones,
    timeZone,
  } = streak;
  const day = week.find((d) => d.date === selected) || week.find((d) => d.isToday);
  const badgeName = milestones.find(([n]) => n === badge)?.[1];
  const earned = earnedMilestones.includes(badge);
  return (
    <section
      className={
        'streak-garden ' + (activeToday ? 'is-watered ' : '') + (cheer ? 'is-cheering' : '')
      }
      aria-labelledby="streak-title"
    >
      <div className="streak-heading">
        <div>
          <span className="bb-eyebrow">
            <Icon name="spark" size={14} /> HONEY’S STREAK GARDEN
          </span>
          <h2 id="streak-title">A little practice. A little bloom.</h2>
          <p>
            {activeToday
              ? 'You showed up today. Honey saved you a flower!'
              : current
                ? 'Your streak is still growing. Give today a little discovery.'
                : totalDays
                  ? 'Every comeback deserves a flower. Ready for a fresh start?'
                  : 'Your first flower is one discovery away. Let’s grow something lovely.'}
          </p>
        </div>
        <div className="streak-heading-tools">
          <span className={'streak-today-tag ' + (activeToday ? 'is-done' : '')}>
            <Icon name={activeToday ? 'check' : 'clock'} size={14} />
            {activeToday ? 'Today is blooming' : 'Today’s flower awaits'}
          </span>
          <button
            type="button"
            className="streak-celebrate"
            onClick={() => setCheer(true)}
            disabled={cheer}
            aria-label="Celebrate my garden"
          >
            {cheer ? 'You’ve got this!' : 'A little cheer'}
            <Icon name={cheer ? 'check' : 'spark'} size={13} />
          </button>
        </div>
      </div>
      <div className="streak-main">
        <div className="streak-score">
          <div className="streak-count">
            <span>{current}</span>
            <svg viewBox="0 0 45 56" aria-hidden="true">
              <path
                d="M24 2C29 15 14 18 19 29C23 26 25 22 25 19C44 35 41 53 23 54C3 54 0 35 12 24C9 36 18 38 18 31C11 17 21 14 24 2Z"
                fill="#f6a35f"
              />
              <path d="M23 35C34 42 29 51 23 51C15 51 14 43 23 35Z" fill="#ffe0a0" />
            </svg>
          </div>
          <h3>{current === 1 ? 'day streak' : 'days in a row'}</h3>
          <div className="streak-records">
            <span>
              <Icon name="flag" size={14} />
              <strong>{longest}</strong> personal best
            </span>
            <span>
              <Icon name="check" size={14} />
              <strong>{totalDays}</strong> days practiced
            </span>
          </div>
          <Link
            className={'bb-button ' + (activeToday ? 'bb-button-secondary' : 'bb-button-primary')}
            to={`/practice/${nextLab}`}
          >
            {activeToday
              ? 'Another little adventure?'
              : current
                ? 'Keep my garden growing'
                : totalDays
                  ? 'Grow a fresh streak'
                  : 'Plant my first flower'}
            <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="streak-week-wrap">
          <div className="streak-week-heading">
            <span>YOUR WEEK IN BLOOM</span>
            <small>{week.filter((d) => d.active).length} of 7 days</small>
          </div>
          <div className="streak-week" aria-label="This week’s practice garden">
            {week.map((item, index) => (
              <button
                type="button"
                key={item.date}
                className={
                  'streak-day ' +
                  (item.active ? 'is-active ' : '') +
                  (item.isToday ? 'is-today ' : '') +
                  (item.future ? 'is-future' : '')
                }
                aria-label={`${item.fullLabel}: ${item.active ? 'lab completed' : item.isToday ? 'today, not completed yet' : item.future ? 'upcoming' : 'no practice recorded'}`}
                aria-pressed={day?.date === item.date}
                onClick={() => setSelected(item.date)}
              >
                <span className="streak-day-label">{item.isToday ? 'Today' : item.label}</span>
                <Flower active={item.active} today={item.isToday} index={index} />
                <span className="streak-day-dot">
                  {item.active ? <Icon name="check" size={11} /> : item.isToday ? '·' : ''}
                </span>
              </button>
            ))}
          </div>
          <p className="streak-day-detail" aria-live="polite">
            {day?.fullLabel} ·{' '}
            {day?.active
              ? 'A discovery made. A flower earned.'
              : day?.future
                ? 'A little space for a future discovery.'
                : day?.isToday
                  ? 'Complete or replay one lab to make this flower bloom.'
                  : 'No practice recorded. New flowers are still ahead.'}
          </p>
        </div>
      </div>
      <div className="streak-bottom">
        <div className="streak-jar-goal">
          <div className="streak-jar" aria-hidden="true">
            <div
              style={{ height: `${Math.max(9, Math.min(90, (current / nextMilestone) * 90))}%` }}
            />
            <span>•ᴗ•</span>
          </div>
          <div>
            <strong>Next honey jar · {nextMilestone} days</strong>
            <p>
              {nextMilestone - current} more {nextMilestone - current === 1 ? 'day' : 'days'} in a
              row. One sweet step at a time.
            </p>
            <div
              className="streak-goal-track"
              role="progressbar"
              aria-label="Progress to next streak milestone"
              aria-valuemin={0}
              aria-valuemax={nextMilestone}
              aria-valuenow={current}
            >
              <span style={{ width: `${(current / nextMilestone) * 100}%` }} />
            </div>
          </div>
        </div>
        <div className="streak-badges">
          <div className="streak-badge-list" aria-label="Streak milestones">
            {milestones.map(([count, title]) => (
              <button
                type="button"
                key={count}
                aria-label={`${title}, ${count} days, ${earnedMilestones.includes(count) ? 'earned' : 'not yet earned'}`}
                aria-pressed={badge === count}
                className={earnedMilestones.includes(count) ? 'is-earned' : ''}
                onClick={() => setBadge(count)}
              >
                <Icon name={earnedMilestones.includes(count) ? 'check' : 'spark'} size={13} />
                {count}
                <small>d</small>
              </button>
            ))}
          </div>
          <p aria-live="polite">
            <strong>{badgeName}</strong> ·{' '}
            {earned
              ? 'Earned! A sweet memory of your best streak.'
              : `Bloom for ${badge} consecutive days to earn this badge.`}
          </p>
        </div>
      </div>
      <p className="streak-rules">
        <Icon name="clock" size={12} /> One successful lab or replay per day counts. Your day resets
        at midnight in {timeZone.replaceAll('_', ' ')}. Missing a day starts a fresh streak; your
        best and badges stay.
      </p>
      {cheer && (
        <div className="streak-confetti" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <i
              key={i}
              style={{
                '--x': `${5 + i * 5}%`,
                '--turn': `${i * 47}deg`,
                '--delay': `${(i % 6) * 0.06}s`,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
