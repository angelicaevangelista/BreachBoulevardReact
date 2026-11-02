import React from 'react';
import AppShell, { Mascot, Icon, ProgressRing } from '../components/Interface';
import { Link } from '../routing';
import { practiceLabs } from '../data/practice-labs';
import useLabProgress from '../hooks/useLabProgress';
import { useLearner } from '../components/LearnerGate';
import { labIcons } from './practice';
import { rankFor } from '../data/community';
import StreakGarden from '../components/StreakGarden';
import MissionTeaser from '../components/MissionTeaser';
export default function Dashboard() {
  const { progress, streak, completed, loading, error, reload } = useLabProgress();
  const learner = useLearner();
  const name =
    learner?.user?.name?.split(' ')[0] || learner?.user?.email?.split('@')[0] || 'curious human';
  const next = practiceLabs.find((lab) => !progress[lab.id]) || practiceLabs[0];
  const remaining = practiceLabs.filter((lab) => !progress[lab.id]);
  const pathPreview = (remaining.length ? remaining : practiceLabs).slice(0, 4);
  const rank = rankFor(completed.length);
  return (
    <AppShell title="Dashboard" showSidebarBuddy={false}>
      <section className="bb-hero">
        <div className="bb-hero-copy">
          <span className="bb-eyebrow">
            <Icon name="spark" size={14} /> YOUR NEXT DISCOVERY AWAITS
          </span>
          <h1>
            Hey, {name}.<br />
            Let’s make a little progress<span className="bb-orange">.</span>
          </h1>
          <p>
            Big skills start with small discoveries. Your next challenge is ready whenever you are.
          </p>
          <div className="bb-hero-actions">
            <Link className="bb-button bb-button-primary" to={`/practice/${next.id}`}>
              {completed.length ? 'Continue learning' : 'Start your first lab'}
              <Icon name="arrow" size={16} />
            </Link>
            <Link className="bb-button bb-button-secondary" to="/practice">
              Explore labs
            </Link>
          </div>
        </div>
        <div className="bb-hero-art">
          <Mascot />
          <span className="bb-hero-sticker">✦ You’ve got this, human.</span>
        </div>
      </section>
      {error && (
        <p role="alert" className="bb-notice">
          {error}
          <button onClick={reload}>Try again</button>
        </p>
      )}
      <StreakGarden streak={streak} loading={loading} nextLab={next.id} />
      <div className="bb-stats">
        {[
          [
            'flag',
            'Labs completed',
            loading ? '—' : completed.length,
            `of ${practiceLabs.length} security challenges`,
          ],
          [
            'flask',
            'Ready to explore',
            loading ? '—' : practiceLabs.length - completed.length,
            'A new discovery in every lab',
          ],
          [
            'clock',
            'Guided practice',
            practiceLabs.reduce((sum, lab) => sum + lab.minutes, 0),
            'minutes across the full lab collection',
          ],
        ].map(([icon, label, value, note]) => (
          <section className="bb-stat" key={label}>
            <span className="bb-stat-icon">
              <Icon name={icon} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <p>{note}</p>
            </div>
          </section>
        ))}
      </div>
      <MissionTeaser />
      <div className="bb-dashboard-grid">
        <section className="bb-panel">
          <div className="bb-panel-heading">
            <h2>Your learning path</h2>
            <span>{remaining.length ? 'Up next for you' : 'Revisit a favorite'}</span>
          </div>
          {pathPreview.map((lab, index) => (
            <div className="bb-topic-row" key={lab.id}>
              <span className="bb-stat-icon">
                <Icon name={labIcons[index % labIcons.length]} size={19} />
              </span>
              <div>
                <h3>{lab.title}</h3>
                <p>
                  {lab.platform.name} · {lab.difficulty} · {lab.minutes} min ·{' '}
                  {loading ? 'Loading…' : progress[lab.id] ? 'Completed' : 'Ready when you are'}
                </p>
                <div className="bb-topic-progress">
                  <span style={{ width: progress[lab.id] ? '100%' : '0%' }} />
                </div>
              </div>
              <Link to={`/practice/${lab.id}`} aria-label={`Open ${lab.title}`}>
                <Icon name={progress[lab.id] ? 'check' : 'arrow'} size={19} />
              </Link>
            </div>
          ))}
          <Link className="bb-path-view-all" to="/practice">
            View all {practiceLabs.length} labs
            <Icon name="arrow" size={15} />
          </Link>
        </section>
        <section className="bb-panel">
          <div className="bb-panel-heading">
            <h2>Your journey so far</h2>
            <span className="bb-tag bb-tag-orange">
              {loading ? 'Loading…' : `${completed.length} of ${practiceLabs.length}`}
            </span>
          </div>
          {loading ? (
            <p role="status" className="bb-journey-note">
              Loading your saved progress…
            </p>
          ) : (
            <>
              <ProgressRing completed={completed.length} total={practiceLabs.length} />
              <p className="bb-journey-note">
                {completed.length === practiceLabs.length ? (
                  <strong>All challenges completed. Nicely done!</strong>
                ) : completed.length ? (
                  <>
                    <strong>Look at you go.</strong> Keep that curiosity going.
                  </>
                ) : (
                  <>
                    Every expert starts somewhere.
                    <br />
                    <strong>Your first flag is waiting.</strong>
                  </>
                )}
              </p>
            </>
          )}
          <div className="bb-next-step">
            <span className="bb-stat-icon">
              <Icon name="spark" />
            </span>
            <div>
              <h3>
                {completed.length === practiceLabs.length
                  ? 'Ready for another round?'
                  : 'Up next for you'}
              </h3>
              <p>{next.title}</p>
              <Link className="bb-button bb-button-soft" to={`/practice/${next.id}`}>
                {completed.length === practiceLabs.length ? 'Practice again' : 'Let’s try it'}
                <Icon name="arrow" size={14} />
              </Link>
            </div>
          </div>
          {completed.length > 0 && (
            <div className="bb-complete-list">
              {completed.slice(0, 3).map((lab) => (
                <Link key={lab.id} to={`/practice/${lab.id}`}>
                  <Icon name="check" size={15} />
                  {lab.title}
                </Link>
              ))}
              {completed.length > 3 && (
                <Link className="bb-path-more" to="/practice">
                  +{completed.length - 3} more completed · See all progress
                  <Icon name="arrow" size={13} />
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
      <section className="bb-panel bb-boulevard-teaser">
        <span className="bb-stat-icon">
          <Icon name="shield" />
        </span>
        <div>
          <small>BREACH BOULEVARD</small>
          <h2>{loading ? 'Finding your block…' : rank.title}</h2>
          <p>
            {loading
              ? 'Checking your progress.'
              : rank.nextTitle
                ? `${rank.labsToNext} more ${rank.labsToNext === 1 ? 'lab' : 'labs'} until ${rank.nextTitle}. Walk the streets, share what you learn and help the next learner.`
                : 'Top rank reached. Walk the streets, share what you learn and help the next learner.'}
          </p>
        </div>
        <Link className="bb-button bb-button-primary" to="/community">
          Walk the boulevard
          <Icon name="arrow" size={16} />
        </Link>
      </section>
    </AppShell>
  );
}
