import React, { useId, useEffect, useState } from 'react';
import { Link, assetUrl } from '../routing';
import { useLearner } from './LearnerGate';

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
export function Mascot({ className = '', compact = false }) {
  const gradient = useId();
  return (
    <svg
      viewBox="0 0 220 220"
      className={`bb-mascot ${className}`}
      role="img"
      aria-label="Byte, your friendly security buddy"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ffbd78" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="193" rx="52" ry="10" fill="#07111e" opacity=".3" />
      <g className={compact ? '' : 'bb-buddy-float'}>
        <path
          d="M63 87 49 55Q45 42 58 48l34 19 M157 87l14-32q4-13-9-7l-34 19"
          fill="#ffad67"
          stroke="#0d1b2a"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="M109 58V38" stroke="#ffa95e" strokeWidth="6" strokeLinecap="round" />
        <circle cx="109" cy="31" r="9" fill="#ffe0a9" />
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
          <ellipse cx="87" cy="110" rx="7" ry="9" fill="#fff2db" />
          <ellipse cx="133" cy="110" rx="7" ry="9" fill="#fff2db" />
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
        <path d="m103 153 7-3 7 3v7q-2 5-7 7-5-2-7-7z" fill="#fff1d8" />
        <path d="m107 158 2 2 4-4" stroke="#f97316" strokeWidth="2" fill="none" />
        <path
          d="M47 117q-21 0-17 24 M174 117q21-15 23-1"
          stroke="#ffad67"
          strokeWidth="13"
          strokeLinecap="round"
          fill="none"
        />
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
export function Brand({ logo = 'BBLOGO.png' }) {
  return (
    <Link to="/" className="bb-brand">
      <img src={assetUrl(logo)} alt="Breach Boulevard Logo" />
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
          <Mascot />
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
