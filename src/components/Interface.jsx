import React, { useId, useEffect, useState } from 'react';
import { Link, assetUrl } from '../routing';
import { useLearner } from './LearnerGate';
import ThemeToggle from './ThemeToggle';

const paths = {
  grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  flask: 'M9 3h6 M10 3v6L4.6 18a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 9V3 M8 14h8',
  book: 'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z M13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  shield: 'M12 3l8 3v6c0 5-8 9-8 9s-8-4-8-9V6z M8 12l3 3 5-6',
  clock: 'M12 8v5l3 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  check: 'M5 12l4 4L19 6',
  chevron: 'M9 5l7 7-7 7',
  logout: 'M9 4H4v16h5 M12 12h9 M17 8l4 4-4 4',
  lock: 'M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z M12 14v3',
  mail: 'M3 5h18v14H3z M3 6l9 7 9-7',
  spark: 'M12 2l2.7 7.3L22 12l-7.3 2.7L12 22l-2.7-7.3L2 12l7.3-2.7z',
  terminal: 'M4 5h16v14H4z M7 9l3 3-3 3 M13 15h4',
  code: 'M8 6l-6 6 6 6 M16 6l6 6-6 6 M14 3l-4 18',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7 M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  key: 'M14 4a5 5 0 1 1 0 10 5 5 0 0 1 0-10 M10 13l-7 7 M5 18l-2-2 M8 15l-2-2',
  refresh: 'M20 7V3l-3 3a8 8 0 1 0 3 9 M20 7h-5',
  trash: 'M3 6h18 M9 6V3h6v3 M5 6l1 15h12l1-15 M10 10v7 M14 10v7',
  close: 'M6 6l12 12 M18 6L6 18',
  help: 'M9 8a3 3 0 1 1 5 2c-2 1-2 2-2 3 M12 17h.01 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0',
  flag: 'M5 21V3 M5 4c5-4 9 4 15 0v10c-6 4-10-4-15 0',
  heart: 'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 8 15 8 15s13-10 8-15',
  volume: 'M4 9v6h4l5 4V5L8 9H4z M16.5 8.5a5 5 0 0 1 0 7',
  mute: 'M4 9v6h4l5 4V5L8 9H4z M16 9l5 5 M21 9l-5 5',
};
export function Icon({ name = 'spark', size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.spark} />
    </svg>
  );
}
export function Mascot({ className = '', compact = false, ...props }) {
  const gradient = useId();
  return (
    <svg
      viewBox="0 0 220 220"
      width={220}
      height={220}
      className={`bb-mascot ${className}`}
      role="img"
      aria-label="Honey, your friendly security bee"
      {...props}
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffbd78" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="193" rx="52" ry="10" fill="#07111e" opacity=".3" />
      <g className={compact ? '' : 'bb-buddy-float'}>
        <g className="bb-bee-wings">
          <ellipse
            className="bb-bee-wing-left"
            cx="46"
            cy="105"
            rx="25"
            ry="36"
            transform="rotate(-28 46 105)"
            fill="#d9f0f4"
            stroke="#f0fcff"
            strokeWidth="2"
          />
          <ellipse
            className="bb-bee-wing-right"
            cx="174"
            cy="105"
            rx="25"
            ry="36"
            transform="rotate(28 174 105)"
            fill="#d9f0f4"
            stroke="#f0fcff"
            strokeWidth="2"
          />
        </g>
        <path
          d="M86 66Q80 43 68 35 M134 66q6-23 18-31"
          stroke="#ffb26d"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
          data-honey-antennas="two"
        />
        <circle cx="67" cy="31" r="8" fill="#ffe0a9" />
        <circle cx="153" cy="31" r="8" fill="#ffe0a9" />
        <rect
          x="49"
          y="64"
          width="122"
          height="111"
          rx="40"
          fill={`url(#${gradient})`}
          stroke="#ffcb94"
          strokeWidth="3"
        />
        <rect x="63" y="83" width="94" height="62" rx="25" fill="#132b3c" />
        <g className="bb-buddy-eyes">
          {[87, 133].map((x) => (
            <g key={x} transform={`translate(${x} 110)`}>
              <ellipse rx="8" ry="8.5" fill="#ffd999" />
              <ellipse cy=".5" rx="5.8" ry="6.2" fill="#344451" />
              <path
                className="bb-eye-sparkle"
                d="M-2-5.3l.9 2.2 2.2.9-2.2.9-.9 2.2-.9-2.2-2.2-.9 2.2-.9Z"
                fill="#fffdf4"
              />
              <circle cx="2.5" cy="3" r="1.3" fill="#fff4da" />
            </g>
          ))}
        </g>
        <path
          d="M101 124q9 9 18 0"
          fill="none"
          stroke="#ffe1b4"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <ellipse cx="76" cy="124" rx="7" ry="4" fill="#ff997c" opacity=".7" />
        <ellipse cx="144" cy="124" rx="7" ry="4" fill="#ff997c" opacity=".7" />
        <path
          d="M54 150q56 20 112 0 M65 166q45 13 90 0"
          stroke="#21394b"
          strokeWidth="8"
          fill="none"
        />
        <g className="bb-honey-hand-heart" aria-label="Honey makes a heart with her hands">
          {[false, true].map((mirror) => (
            <path
              key={String(mirror)}
              transform={mirror ? 'translate(220 0) scale(-1 1)' : undefined}
              d="M52 132c-5 0-5 6-3 11 4 11 20 18 42 15l3-1c4-1 4-6 0-8-16 2-29-3-34-11-1-4-3-7-8-6Z"
              fill="#ffc58c"
              stroke="#173346"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          ))}
          <g transform="translate(110 153) scale(.8) translate(-110 -153)">
            <path
              d="M110 151c-4-7-12-6-10 1 1 4 6 7 10 11 4-4 9-7 10-11 2-7-6-8-10-1Z"
              fill="#ef3e4a"
              stroke="#b92535"
              strokeWidth="1"
            />
            <path
              d="M102 150q0-3 3-1"
              fill="none"
              stroke="#ffe4dc"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {[false, true].map((mirror) => (
              <g
                key={String(mirror)}
                transform={mirror ? 'translate(220 0) scale(-1 1)' : undefined}
              >
                <path
                  d="M91 150c0-7 5-12 10-12 4 0 8 4 9 8 1 3-2 5-4 3l-4-3c-3-2-5 1-3 4l5 5 5 4c3 3 2 6-1 7-3 1-5-2-8-4-6 1-12-2-11-7Z"
                  fill="#ffdcaf"
                  stroke="#98704b"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                />
                <path
                  d="M96 148q0 3 3 5"
                  fill="none"
                  stroke="#d2a174"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        </g>
        <rect x="73" y="170" width="23" height="15" rx="7" fill="#ffad67" />
        <rect x="124" y="170" width="23" height="15" rx="7" fill="#ffad67" />
      </g>
      <path
        d="m185 48 3 7 8 2-8 3-3 7-2-7-8-3 8-2z M31 74l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"
        fill="#ffd49e"
      />
    </svg>
  );
}
export function Brand({ logo = 'honey-icon.svg' }) {
  return (
    <Link to="/" className="bb-brand">
      <img src={assetUrl(logo)} width="39" height="39" alt="Breach Boulevard Logo" />
      <span>
        Breach
        <span className="bb-brand-second">
          Boulevard<span className="bb-orange">.</span>
        </span>
      </span>
    </Link>
  );
}
export function LoadingScreen({ label = 'Checking your session…', onRetry }) {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 9000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <main className="bb-loading-screen">
      <div className="bb-loading-orbit bb-loading-orbit-one" />
      <div className="bb-loading-orbit bb-loading-orbit-two" />
      <div className="bb-loading-content">
        <span className="bb-eyebrow">
          <Icon name="spark" size={14} /> A little moment of magic
        </span>
        <div className="bb-loading-buddy">
          <svg className="bb-flight-breeze" viewBox="0 0 240 220" aria-hidden="true">
            <path d="M13 105h27 M6 118h21 M15 131h22 M201 95h21 M212 108h21" />
            <circle cx="31" cy="73" r="2" />
            <circle cx="209" cy="145" r="3" />
          </svg>
          <span className="bb-flight-shadow" aria-hidden="true" />
          <div className="bb-honey-flight">
            <Mascot />
          </div>
          <span className="bb-orbit-dot" />
        </div>
        <div role="status" aria-live="polite">
          <h1>
            Good things are loading<span className="bb-orange">.</span>
          </h1>
          <p>{label}</p>
          <div className="bb-loading-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
        <p className="bb-loading-footnote">Getting your little corner of the cyber world ready.</p>
        {slow && onRetry && (
          <button className="bb-button bb-button-secondary" onClick={onRetry}>
            <Icon name="refresh" />
            Taking a while? Try again
          </button>
        )}
      </div>
    </main>
  );
}
export function ProgressRing({ completed, total = 6 }) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="bb-progress-ring" aria-label={`${percent}% completed`}>
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="50" className="bb-ring-track" />
        <circle
          cx="60"
          cy="60"
          r="50"
          className="bb-ring-fill"
          strokeDasharray="314.16"
          strokeDashoffset={314.16 * (1 - percent / 100)}
        />
      </svg>
      <div>
        <strong>
          {percent}
          <small>%</small>
        </strong>
        <span>of your journey</span>
      </div>
    </div>
  );
}
export default function AppShell({
  children,
  active = 'dashboard',
  eyebrow = 'Your learning space',
  title = 'Overview',
  admin = false,
  showSidebarBuddy = true,
}) {
  const learner = useLearner();
  const name = learner?.user?.name || learner?.user?.email?.split('@')[0] || 'Curious learner';
  const links = admin
    ? [
        ['grid', 'Admin console', '/admin', 'admin'],
        ['flask', 'Practice labs', '/practice', 'labs'],
        ['book', 'Courses', '/courses', 'courses'],
      ]
    : [
        ['grid', 'Dashboard', '/dashboard', 'dashboard'],
        ['flask', 'Practice labs', '/practice', 'labs'],
        ['heart', 'Community', '/community', 'community'],
        ['search', 'Story missions', '/missions', 'missions'],
        ['book', 'Courses', '/courses', 'courses'],
        ['help', 'Help & FAQ', '/faq', 'help'],
      ];
  return (
    <div className="bb-ui bb-app">
      <aside className="bb-sidebar">
        <Brand />
        <div className="bb-sidebar-label">
          {admin ? 'MANAGE YOUR SPACE' : 'A LITTLE PRACTICE, EVERY DAY'}
        </div>
        <nav className="bb-side-nav" aria-label="Workspace navigation">
          {links.map(([icon, label, to, key]) => (
            <Link
              key={key}
              to={to}
              className={active === key ? 'is-active' : ''}
              aria-current={active === key ? 'page' : undefined}
            >
              <Icon name={icon} />
              {label}
              {active === key && <span className="bb-nav-dot" />}
            </Link>
          ))}
        </nav>
        {showSidebarBuddy && (
          <div className="bb-sidebar-buddy">
            <Mascot compact />
            <strong>You’ve got this.</strong>
            <p>
              Curiosity is your superpower.
              <br />
              Let’s put it to work.
            </p>
            <Link to="/practice">
              Find a lab <Icon name="arrow" size={15} />
            </Link>
          </div>
        )}
        <div className="bb-sidebar-bottom">
          <span className="bb-status-dot" />A safe place to learn<Link to="/privacy">Privacy</Link>
        </div>
      </aside>
      <div className="bb-app-main">
        <header className="bb-app-header">
          <div className="bb-mobile-brand">
            <Brand />
          </div>
          <div className="bb-header-title">
            <span>{eyebrow}</span>
            <strong>{title}</strong>
          </div>
          <div className="bb-header-account" aria-label="Your account">
            <ThemeToggle />
            <span className="bb-avatar">{admin ? 'A' : name.slice(0, 1).toUpperCase()}</span>
            <div>
              <strong>{admin ? 'Administrator' : name}</strong>
              <span>{admin ? 'Breach Boulevard workspace' : 'One small step at a time'}</span>
            </div>
            {learner?.signOut && (
              <button
                className="bb-icon-button"
                onClick={learner.signOut}
                disabled={learner.signingOut}
                aria-label="Sign out"
                title="Sign out"
              >
                <Icon name="logout" />
              </button>
            )}
          </div>
        </header>
        <nav className="bb-mobile-nav" aria-label="Mobile workspace navigation">
          {links.map(([icon, label, to, key]) => (
            <Link key={key} to={to} className={active === key ? 'is-active' : ''}>
              <Icon name={icon} size={17} />
              {label}
            </Link>
          ))}
        </nav>
        <main className="bb-app-content">
          {learner?.error && (
            <p role="alert" className="bb-notice">
              {learner.error}
            </p>
          )}
          {children}
        </main>
        <footer className="bb-app-footer">
          <span>
            Made for curious minds. <Icon name="heart" size={13} />
          </span>
          <Link to="/privacy">Privacy notice</Link>
        </footer>
      </div>
    </div>
  );
}
