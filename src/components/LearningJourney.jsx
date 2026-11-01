import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from './Interface';
import HoneyBee3D from './HoneyBee3D';
import HoneyChat from './HoneyChat';
import { Link } from '../routing';

const steps = [
  {
    label: 'Pick a lab',
    icon: 'flask',
    pill: '1 lab selected',
    title: 'Choose your first challenge.',
    description:
      'Sign in to explore the practice catalog and pick a guided lab. Each challenge gives you a safe, fictional scenario to investigate.',
    link: '/practice',
    linkText: 'Explore the labs',
    status: 'Lab selected',
    lit: [0],
    cards: [
      { title: 'Break the login query', tag: 'SQL', state: 'Selected' },
      { title: 'Find the unsafe comment sink', tag: 'XSS', state: 'Open' },
      { title: 'Discover the default password', tag: 'AUTH', state: 'Open' },
    ],
    footer: 'Pick a lab to begin',
    rows: [
      ['Lab', 'Break the login query', 100],
      ['Clue', 'Waiting for you', 0],
      ['Honey', 'On standby', 0],
      ['Flag', 'Locked', 0],
    ],
  },
  {
    label: 'Ask Honey',
    icon: 'help',
    pill: 'Honey is online',
    title: 'Stuck? Ask Honey.',
    description:
      'Honey is your AI helper inside the platform. When a lab stumps you, ask for a nudge toward your next step.',
    link: '/practice',
    linkText: 'Explore the labs',
    status: 'Honey helped',
    lit: [1, 2],
    cards: [
      { title: 'Break the login query', tag: 'SQL', state: 'In progress' },
      { chat: 'user', text: "I'm stuck. What now?" },
      { chat: 'honey', text: 'Check how your input joins the query.' },
    ],
    footer: 'Hint shared, keep going',
    rows: [
      ['Lab', 'Break the login query', 60],
      ['Clue', 'Looking for it', 40],
      ['Honey', 'Hint shared', 100],
      ['Flag', 'Locked', 0],
    ],
  },
  {
    label: 'See your progress',
    icon: 'flag',
    pill: 'Level complete',
    title: 'Turn discoveries into progress.',
    description:
      'Complete a guided lab to see your progress. Completed labs are saved to your account, so you can come back for the next one.',
    link: '/access',
    linkText: 'Get started',
    status: 'Completed',
    lit: [0, 1, 2, 3],
    cards: [
      { title: 'Break the login query', tag: 'SQL', state: 'Done' },
      { title: 'Clue found', tag: 'HINT', state: 'Done' },
      { title: 'Hint used', tag: 'HONEY', state: 'Done' },
    ],
    footer: 'Flag captured, 3 of 6',
    rows: [
      ['Lab', 'Break the login query', 100],
      ['Clue', 'Found', 100],
      ['Honey', 'Hint used', 100],
      ['Flag', 'Captured', 100],
    ],
  },
];

const CONNECTORS = [0, 1, 2, 3];
const SIDE_ICONS = ['shield', 'flask', 'terminal', 'flag', 'help'];

export default function LearningJourney() {
  const [selected, setSelected] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [paths, setPaths] = useState([]);
  const stageRef = useRef(null);
  const step = steps[selected];

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    setPaths(
      CONNECTORS.map((index) => {
        const anchor = stage.querySelector(`[data-anchor="${index}"]`);
        const row = stage.querySelector(`[data-row="${index}"]`);
        if (!anchor || !row) return null;
        const from = anchor.getBoundingClientRect();
        const to = row.getBoundingClientRect();
        const x1 = from.right - box.left;
        const y1 = from.top + from.height / 2 - box.top;
        const x2 = to.left - box.left;
        const y2 = to.top + to.height / 2 - box.top;
        const curve = Math.max((x2 - x1) * 0.5, 0);
        return `M${x1} ${y1} C${x1 + curve} ${y1} ${x2 - curve} ${y2} ${x2} ${y2}`;
      })
    );
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, selected]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;
    window.addEventListener('resize', measure);
    document.fonts?.ready?.then(measure);
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
    observer?.observe(stage);
    return () => {
      window.removeEventListener('resize', measure);
      observer?.disconnect();
    };
  }, [measure]);

  useEffect(() => {
    const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!preference) return;
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!playing || reducedMotion) return;
    const timer = window.setInterval(
      () => setSelected((value) => (value + 1) % steps.length),
      4500
    );
    return () => window.clearInterval(timer);
  }, [playing, reducedMotion]);

  return (
    <section className="bb-home-section bb-journey bb-reveal" aria-labelledby="journey-title">
      <span className="bb-eyebrow">
        <Icon name="spark" size={15} /> YOUR LEARNING PATH
      </span>
      <h2 id="journey-title">A little journey, a lot to discover.</h2>
      <p>Watch your journey unfold, from your first lab to your next discovery.</p>
      <div
        className={`bb-flow${playing && !reducedMotion ? '' : ' is-paused'}`}
        ref={stageRef}
      >
        <div className="bb-flow-phone" aria-hidden="true">
          <div className="bb-flow-phone-top">
            <span className="bb-flow-camera" />
            <span className="bb-flow-pill">{step.pill}</span>
          </div>
          {step.cards.map((card, index) =>
            card.chat ? (
              <div
                key={index}
                className={`bb-flow-chat bb-flow-chat-${card.chat}`}
                data-anchor={index}
              >
                {card.text}
              </div>
            ) : (
              <div key={index} className="bb-flow-card" data-anchor={index}>
                <span className="bb-flow-card-tag">{card.tag}</span>
                <strong>{card.title}</strong>
                <span className="bb-flow-card-state">{card.state}</span>
              </div>
            )
          )}
          <div className="bb-flow-footer" data-anchor={CONNECTORS.length - 1}>
            {step.footer}
          </div>
        </div>

        <svg className="bb-flow-lines" aria-hidden="true">
          {paths.map((d, index) =>
            d ? (
              <path
                key={index}
                d={d}
                className={step.lit.includes(index) ? 'is-lit' : ''}
              />
            ) : null
          )}
        </svg>

        <div className="bb-flow-dash" aria-hidden="true">
          <aside className="bb-flow-side">
            {SIDE_ICONS.map((name, index) => (
              <span key={name} className={index === 0 ? 'is-active' : ''}>
                <Icon name={name} size={15} />
              </span>
            ))}
          </aside>
          <div className="bb-flow-main">
            <div className="bb-flow-topbar">
              <strong>Breach Boulevard</strong>
              <span>Mission control</span>
            </div>
            <div className="bb-flow-head">
              <div>
                <span className="bb-flow-kicker">YOUR PROGRESS</span>
                <h3>Lab run</h3>
              </div>
              <span className="bb-flow-status">{step.status}</span>
            </div>
            <div className="bb-flow-tabs">
              {['Pick', 'Ask Honey', 'Progress'].map((tab, index) => (
                <span key={tab} className={selected === index ? 'is-active' : ''}>
                  {tab}
                </span>
              ))}
            </div>
            <div className="bb-flow-table">
              <div className="bb-flow-row bb-flow-row-head">
                <span>Field</span>
                <span>Value</span>
                <span>Status</span>
              </div>
              {step.rows.map(([label, value, pct], index) => (
                <div
                  key={label}
                  className={`bb-flow-row${step.lit.includes(index) ? ' is-lit' : ''}`}
                  data-row={index}
                >
                  <span>{label}</span>
                  <span>{value}</span>
                  <span className="bb-flow-bar">
                    <i style={{ width: `${pct}%` }} />
                  </span>
                </div>
              ))}
            </div>
            <div className="bb-flow-chips">
              <span className={selected === 2 ? 'is-on' : ''}>Validated</span>
              <span className={selected === 2 ? 'is-on' : ''}>Saved to account</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bb-journey-controls">
        <span className="bb-journey-kicker">THE JOURNEY</span>
        <button
          type="button"
          className="bb-journey-play"
          disabled={reducedMotion}
          onClick={() => setPlaying((value) => !value)}
        >
          {reducedMotion ? 'Motion reduced' : playing ? 'Pause animation' : 'Play animation'}
        </button>
      </div>
      <div className="bb-journey-steps" aria-label="Explore the learning journey">
        {steps.map((item, index) => (
          <button
            type="button"
            key={item.label}
            className={selected === index ? 'is-active' : ''}
            aria-pressed={selected === index}
            onClick={() => {
              setSelected(index);
              setPlaying(false);
            }}
          >
            <span>0{index + 1}</span> {item.label}
          </button>
        ))}
      </div>
      <div className="bb-journey-detail-row">
        <div className="bb-journey-detail">
          <span className="bb-journey-detail-icon">
            <Icon name={step.icon} size={22} />
          </span>
          <span className="bb-journey-kicker">STEP 0{selected + 1} / 03</span>
          <h3>{step.title}</h3>
          <p>{step.description}</p>
          <Link to={step.link} className="bb-journey-link">
            {step.linkText} <Icon name="arrow" size={16} />
          </Link>
        </div>
        <aside className="bb-honey-card">
          <div className="bb-honey-head">
            <HoneyBee3D size={150} />
            <p>
              <strong>Stuck? Ask Honey.</strong> Your in-platform AI helper, ready when a lab gets
              tricky.
            </p>
          </div>
          <HoneyChat labId="sql-injection" />
        </aside>
      </div>
    </section>
  );
}
