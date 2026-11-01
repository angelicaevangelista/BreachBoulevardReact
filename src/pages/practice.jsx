import React, { useEffect, useRef, useState } from 'react';
import { Link, assetUrl, useRouter } from '../routing';
import { practiceLabs, findPracticeLab } from '../data/practice-labs';
import AppShell, { Icon, Mascot } from '../components/Interface';
import useLabProgress from '../hooks/useLabProgress';
export const labIcons = ['terminal', 'code', 'key', 'eye', 'shield', 'book'];
function Challenge({ lab, onComplete, solved }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(lab.fields.map((field) => [field.key, field.initial]))
  );
  const [hints, setHints] = useState(0),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch(assetUrl(`api/practice/${lab.id}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok || !data.success)
        throw new Error(data.message || 'The attempt could not be checked. Please try again.');
      if (!controller.signal.aborted) {
        setResult(data);
        if (data.completed) onComplete(lab.id, data.completedLabs);
      }
    } catch (error) {
      if (!controller.signal.aborted) setResult({ feedback: error.message });
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  const next =
    practiceLabs[(practiceLabs.findIndex((item) => item.id === lab.id) + 1) % practiceLabs.length];
  return (
    <>
      <Link to="/practice" className="bb-breadcrumb">
        <Icon name="back" size={16} /> All practice labs
      </Link>
      <div className="bb-page-heading">
        <div>
          <span className="bb-eyebrow">{lab.category}</span>
          <h1>{lab.title}</h1>
          <p>{lab.summary}</p>
        </div>
        <span className={`bb-tag ${solved ? 'bb-tag-green' : 'bb-tag-orange'}`}>
          {solved ? '✓ Completed' : `${lab.difficulty} · ${lab.minutes} min`}
        </span>
      </div>
      <div className="bb-challenge-grid">
        <section className="bb-panel">
          <span className="bb-challenge-label">
            <Icon name="flag" size={15} /> YOUR MISSION
          </span>
          <h2 className="bb-challenge-title">Let’s investigate.</h2>
          <p className="bb-challenge-description">{lab.objective}</p>
          <form className="bb-form" onSubmit={submit}>
            {lab.fields.map((field) => (
              <div className="bb-field" key={field.key}>
                <label htmlFor={field.key}>{field.label}</label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    rows={5}
                    maxLength={4096}
                    value={values[field.key]}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type || 'text'}
                    autoComplete="off"
                    maxLength={4096}
                    value={values[field.key]}
                    onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                  />
                )}
              </div>
            ))}
            <button disabled={busy} className="bb-button bb-button-primary bb-button-wide">
              <Icon name={busy ? 'refresh' : 'terminal'} size={17} />
              {busy ? 'Checking…' : 'Run attempt'}
            </button>
          </form>
          <div className="bb-hints">
            <div className="bb-hints-heading">
              <Mascot compact />
              <div>
                <h3>A little nudge?</h3>
                <p>Byte has a hint when you need one.</p>
              </div>
            </div>
            <ol>
              {lab.hints.slice(0, hints).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
            <button
              disabled={hints === lab.hints.length}
              onClick={() => setHints((count) => count + 1)}
            >
              {hints === lab.hints.length ? 'All hints revealed' : `Reveal hint ${hints + 1}`}
            </button>
          </div>
        </section>
        <section className="bb-panel bb-response" aria-live="polite" aria-busy={busy}>
          <div className="bb-response-header">
            <div className="bb-code-dots">
              <i />
              <i />
              <i />
            </div>
            <span>lab-response.console</span>
            <Icon name="terminal" size={16} />
          </div>
          {result ? (
            <div className="bb-response-content">
              <h2 className="bb-challenge-title">Lab response</h2>
              <p>
                {result.completed ? 'Challenge completed! ' : ''}
                {result.feedback}
              </p>
              {result.output && <pre>{JSON.stringify(result.output, null, 2)}</pre>}
              {result.completed && (
                <div className="bb-completion">
                  <strong>
                    <Icon name="check" size={17} /> Nicely done. Flag captured!
                  </strong>
                  <code>{result.flag}</code>
                  <h3>How to prevent it</h3>
                  <p>{lab.lesson}</p>
                  <Link className="bb-button bb-button-soft" to={`/practice/${next.id}`}>
                    Try the next lab <Icon name="arrow" size={15} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="bb-response-empty">
              <Mascot />
              <h3>{busy ? 'Following the clues…' : 'Your discovery goes here.'}</h3>
              <p>
                {busy
                  ? 'Checking your attempt. Hang tight!'
                  : 'Run an attempt to inspect the simulated response.'}
              </p>
            </div>
          )}
          <p className="bb-response-footnote">
            <Icon name="shield" size={15} /> Fictional data. A safe space to experiment.
          </p>
        </section>
      </div>
    </>
  );
}
export default function Practice() {
  const router = useRouter(),
    location = router?.location || window.location.pathname;
  const id = location.split(/[?#]/)[0].match(/\/practice\/([^/]+)\/?$/)?.[1],
    lab = findPracticeLab(id);
  const { progress, loading, error, completed, recordCompletion, reload } = useLabProgress();
  const [query, setQuery] = useState(''),
    [difficulty, setDifficulty] = useState('all'),
    [status, setStatus] = useState('all');
  const filtered = practiceLabs.filter(
    (item) =>
      `${item.title} ${item.category} ${item.summary}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (difficulty === 'all' || item.difficulty === difficulty) &&
      (status === 'all' || (status === 'completed' ? progress[item.id] : !progress[item.id]))
  );
  return (
    <AppShell active="labs" title="Practice labs" eyebrow="A little curiosity goes a long way">
      {error && (
        <p className="bb-notice" role="alert">
          {error}
          <button onClick={reload}>Try again</button>
        </p>
      )}
      {id ? (
        lab ? (
          <Challenge
            key={id}
            lab={lab}
            solved={Boolean(progress[id])}
            onComplete={recordCompletion}
          />
        ) : (
          <div className="bb-empty">
            <Mascot />
            <h1>Lab not found</h1>
            <Link className="bb-button bb-button-primary" to="/practice">
              Browse practice labs
            </Link>
          </div>
        )
      ) : (
        <>
          <div className="bb-page-heading">
            <div>
              <span className="bb-eyebrow">
                <Icon name="flask" size={14} /> LEARN BY DOING
              </span>
              <h1>
                Small labs. Big discoveries<span className="bb-orange">.</span>
              </h1>
              <p>
                Pick something that sparks your curiosity. Try, explore, and ask Byte for a hint
                along the way.
              </p>
            </div>
            <span className="bb-tag bb-tag-orange" role="status">
              {loading
                ? 'Loading progress…'
                : `${completed.length} of ${practiceLabs.length} completed`}
            </span>
          </div>
          <div className="bb-lab-toolbar">
            <label className="bb-search">
              <Icon name="search" size={18} />
              <input
                aria-label="Search labs"
                type="search"
                placeholder="Find your next challenge…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <select
              className="bb-filter-select"
              aria-label="Lab difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="all">All difficulties</option>
              {[...new Set(practiceLabs.map((item) => item.difficulty))].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <Link className="bb-button bb-button-quiet" to="/dashboard">
              <Icon name="grid" size={16} /> My progress
            </Link>
          </div>
          <div className="bb-tabs" aria-label="Filter labs by completion">
            {[
              ['all', 'All labs', practiceLabs.length],
              ['new', 'Not started', practiceLabs.length - completed.length],
              ['completed', 'Completed', completed.length],
            ].map(([value, label, count]) => (
              <button
                key={value}
                aria-pressed={status === value}
                className={status === value ? 'is-active' : ''}
                onClick={() => setStatus(value)}
              >
                {label}
                <span>{count}</span>
              </button>
            ))}
          </div>
          <p className="bb-lab-count" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'lab' : 'labs'} to explore · Progress is
            saved to your account.
          </p>
          <div className="bb-lab-grid">
            {filtered.map((item) => {
              const index = practiceLabs.indexOf(item);
              return (
                <article className="bb-lab-card" key={item.id}>
                  <Link
                    to={`/practice/${item.id}`}
                    aria-label={`${progress[item.id] ? 'Practice again' : 'Start lab'}: ${item.title}`}
                  >
                    <div className="bb-lab-card-top">
                      <span
                        className={`bb-lab-icon ${index % 3 === 1 ? 'is-purple' : index % 3 === 2 ? 'is-mint' : ''}`}
                      >
                        <Icon name={labIcons[index]} size={23} />
                      </span>
                      <span className={`bb-tag ${progress[item.id] ? 'bb-tag-green' : ''}`}>
                        {progress[item.id] ? '✓ Completed' : item.difficulty}
                      </span>
                    </div>
                    <p className="bb-lab-category">{item.category}</p>
                    <h2>{item.title}</h2>
                    <p className="bb-lab-summary">{item.summary}</p>
                    <div className="bb-lab-meta">
                      <span>
                        <Icon name="clock" size={13} />
                        {item.minutes} min
                      </span>
                      <span>
                        <Icon name="help" size={13} />
                        Hints included
                      </span>
                    </div>
                    <span className="bb-card-action">
                      {progress[item.id] ? 'Practice again' : 'Start lab'}
                      <Icon name="arrow" size={17} />
                    </span>
                  </Link>
                </article>
              );
            })}
          </div>
          {!filtered.length && (
            <div className="bb-panel bb-empty">
              <Mascot />
              <h3>No labs in this little corner yet.</h3>
              <p>Try another search or clear your filters to explore all six challenges.</p>
              <button
                className="bb-button bb-button-secondary"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setDifficulty('all');
                }}
              >
                Clear filters
              </button>
            </div>
          )}
          <div className="bb-catalog-banner">
            <div>
              <h3>New to this? You’re in the right place.</h3>
              <p>Start with a beginner lab. Every challenge comes with hints and a lesson.</p>
            </div>
            <Mascot compact />
            <Link className="bb-button bb-button-soft" to="/practice/sql-injection">
              Try your first lab <Icon name="arrow" size={16} />
            </Link>
          </div>
        </>
      )}
    </AppShell>
  );
}
