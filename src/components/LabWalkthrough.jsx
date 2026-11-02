import React, { useEffect, useRef, useState } from 'react';
import { Link } from '../routing';
import { Icon } from './Interface';
const phases = [
  {
    at: 0,
    label: 'Inspect',
    title: 'Start with a curious question.',
    text: 'A fictional login request places raw input directly into its query.',
  },
  {
    at: 1700,
    label: 'Try',
    title: 'One input changes the story.',
    text: 'Watch the cursor enter a sample input and follow it into the query.',
  },
  {
    at: 6500,
    label: 'Discover',
    title: 'Follow the response.',
    text: 'The simulated response reveals a flag. Reading the response matters as much as sending the request.',
  },
  {
    at: 9700,
    label: 'Capture',
    title: 'Turn a discovery into progress.',
    text: 'Submit the recovered flag. In the real CTFs, the server checks it before saving your completion.',
  },
  {
    at: 12000,
    label: 'Fix',
    title: 'Learn the fix, too.',
    text: 'Parameterized queries keep data separate from SQL syntax. A flag is the beginning of understanding.',
  },
];
const payload = "' OR '1'='1";
const demoFlag = 'BB{demo_query_bypass}';
export default function LabWalkthrough() {
  const [time, setTime] = useState(0),
    [playing, setPlaying] = useState(true),
    [reduced, setReduced] = useState(false);
  const visible = useRef(true),
    root = useRef(null);
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReduced(Boolean(query?.matches));
      if (query?.matches) {
        setPlaying(false);
        setTime(12000);
      }
    };
    update();
    query?.addEventListener?.('change', update);
    return () => query?.removeEventListener?.('change', update);
  }, []);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      visible.current = entries[0].isIntersecting;
    });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || reduced) return;
    const timer = setInterval(() => {
      if (visible.current) setTime((previous) => (previous + 80) % 15500);
    }, 80);
    return () => clearInterval(timer);
  }, [playing, reduced]);
  const phase = phases.reduce((last, item, index) => (time >= item.at ? index : last), 0),
    step = phases[phase];
  const typed = payload.slice(0, Math.max(0, Math.floor((time - 1900) / 185)));
  const typedFlag = demoFlag.slice(0, Math.max(0, Math.floor((time - 7900) / 80)));
  const pointerTarget =
    time < 1500
      ? '.walkthrough-logo'
      : time < 4500
        ? '.walkthrough-login label .walkthrough-input'
        : time < 6100
          ? '.walkthrough-login > button'
          : time < 7800
            ? '.walkthrough-found'
            : time < 9600
              ? '.walkthrough-capture .walkthrough-input'
              : '.walkthrough-capture > button';
  const [pointer, setPointer] = useState({ left: '13%', top: '29%' });
  useEffect(() => {
    const stage = root.current?.querySelector('.walkthrough-stage');
    function measure() {
      const target = root.current?.querySelector(pointerTarget);
      if (!stage || !target) return;
      const area = stage.getBoundingClientRect(),
        box = target.getBoundingClientRect();
      if (!area.width) return;
      setPointer({
        left: Math.min(area.width - 40, box.left - area.left + box.width * 0.64) + 'px',
        top: box.top - area.top + box.height * 0.48 + 'px',
      });
    }
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    if (stage) observer?.observe(stage);
    return () => observer?.disconnect();
  }, [pointerTarget]);
  function choose(index) {
    setTime(phases[index].at + (index === 1 ? 1200 : 0));
    setPlaying(false);
  }
  return (
    <section
      ref={root}
      className="bb-home-section lab-walkthrough"
      aria-labelledby="walkthrough-title"
    >
      <div className="walkthrough-heading">
        <div>
          <span className="bb-eyebrow">
            <Icon name="terminal" size={15} /> WATCH A LITTLE DISCOVERY UNFOLD
          </span>
          <h2 id="walkthrough-title">From “what if?” to flag captured.</h2>
          <p>
            A narrated example of the learning flow. This demo doesn’t change your account or solve
            a CTF for you.
          </p>
        </div>
        <div className="walkthrough-controls">
          <button
            className="bb-button bb-button-secondary"
            type="button"
            onClick={() => {
              setPlaying(!reduced);
              setTime(0);
            }}
            aria-label="Replay lab walkthrough"
          >
            <Icon name="refresh" size={15} />
            Replay
          </button>
          <button
            type="button"
            className="bb-button bb-button-soft"
            disabled={reduced}
            aria-pressed={playing}
            onClick={() => setPlaying((value) => !value)}
          >
            {reduced ? 'Motion reduced' : playing ? 'Pause demo' : 'Play demo'}
          </button>
        </div>
      </div>
      <div className="walkthrough-browser">
        <div className="target-browser-chrome">
          <span className="bb-code-dots">
            <i />
            <i />
            <i />
          </span>
          <div>
            <Icon name="lock" size={12} />
            gatehouse.lab.invalid/sign-in
          </div>
          <span>GUIDED DEMO</span>
        </div>
        <div className="walkthrough-stage">
          <div className="walkthrough-login">
            <span className="walkthrough-logo">
              <Icon name="lock" size={20} />
              Gatehouse.
            </span>
            <h3>
              Your workspace
              <br />
              is one hello away.
            </h3>
            <label>
              Username
              <span className={'walkthrough-input ' + (phase === 1 ? 'is-focused' : '')}>
                {phase >= 2 ? payload : typed}
                <i className="walkthrough-caret" />
              </span>
            </label>
            <label>
              Password<span className="walkthrough-input walkthrough-password">••••••••</span>
            </label>
            <button
              type="button"
              className={time > 5100 && time < 6100 ? 'is-clicked' : ''}
              onClick={() => {
                setTime(6500);
                setPlaying(false);
              }}
            >
              Sign in
              <Icon name="arrow" size={14} />
            </button>
            <span className="walkthrough-small">A fictional training account.</span>
          </div>
          <div className="walkthrough-investigation">
            <div className="walkthrough-console">
              <div>
                <span className="bb-code-dots">
                  <i />
                  <i />
                  <i />
                </span>
                <small>request / response</small>
                <span className="target-chip">{phase >= 2 ? '200 OK' : 'Awaiting request'}</span>
              </div>
              <pre>
                <span>SELECT * FROM users</span>
                <br />
                WHERE username ={' '}
                <b>{phase >= 1 ? "'" + (phase >= 2 ? payload : typed) + "'" : "'your input'"}</b>
                <br />
                AND password = '••••';
              </pre>
              {phase >= 2 ? (
                <div className="walkthrough-found">
                  <Icon name="flag" size={17} />
                  <div>
                    <strong>Private training response</strong>
                    <code>{demoFlag}</code>
                  </div>
                  <span>↗</span>
                </div>
              ) : (
                <p className="walkthrough-console-empty">The next clue is often in the response.</p>
              )}
            </div>
            <div className={'walkthrough-capture ' + (phase >= 3 ? 'is-complete' : '')}>
              <div>
                <Icon name={phase >= 3 ? 'check' : 'flag'} size={16} />
                <h4>{phase >= 3 ? 'Discovery captured.' : 'Capture your discovery.'}</h4>
              </div>
              <span className="walkthrough-input">
                {phase >= 3 ? demoFlag : typedFlag || 'Paste the recovered flag…'}
                {time > 7900 && time < 9600 && <i className="walkthrough-caret" />}
              </span>
              <button
                type="button"
                onClick={() => {
                  setTime(10500);
                  setPlaying(false);
                }}
              >
                {phase >= 3 ? '✓ Flag accepted' : 'Submit flag'}
              </button>
            </div>
          </div>
          <div
            className={
              'walkthrough-cursor ' +
              ((time > 5300 && time < 6100) || (time > 9700 && time < 10400) ? 'is-clicking' : '')
            }
            style={pointer}
            aria-hidden="true"
          >
            <svg width="27" height="33" viewBox="0 0 27 33">
              <path
                d="M3 2v24l7-6 5 11 5-3-5-10h10Z"
                fill="#f7a966"
                stroke="#132337"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
            <span>Follow the clue</span>
          </div>
        </div>
        <div className="walkthrough-caption">
          <div>
            <span>0{phase + 1} / 05</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
          {phase === 4 ? (
            <code>db.query('… WHERE username = ?', [input])</code>
          ) : (
            <Link to="/practice/sql-injection">
              Try this guided lab
              <Icon name="arrow" size={16} />
            </Link>
          )}
        </div>
      </div>
      <div className="walkthrough-steps" aria-label="Walkthrough steps">
        {phases.map((item, index) => (
          <button
            type="button"
            key={item.label}
            className={phase === index ? 'is-active' : ''}
            aria-pressed={phase === index}
            onClick={() => choose(index)}
          >
            <span>0{index + 1}</span>
            {item.label}
          </button>
        ))}
      </div>
    </section>
  );
}
