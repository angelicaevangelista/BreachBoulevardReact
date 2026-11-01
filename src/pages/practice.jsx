import React, { useEffect, useRef, useState } from 'react';
import { Link, assetUrl, useRouter } from '../routing';
import { practiceLabs, findPracticeLab } from '../data/practice-labs';
import { useLearner } from '../components/LearnerGate';

const progressKey = 'breach.practice.progress.v1';
function readProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(progressKey) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}
const button =
  'bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-lg disabled:opacity-50';
function Challenge({ lab, onComplete, solved }) {
  const [values, setValues] = useState(() =>
    Object.fromEntries(lab.fields.map((field) => [field.key, field.initial]))
  );
  const [hints, setHints] = useState(0);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const request = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  async function submit(event) {
    event.preventDefault();
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
  return (
    <>
      <Link to="/practice" className="text-orange-400 hover:underline">
        ← All practice labs
      </Link>
      <div className="mt-6 mb-8">
        <p className="text-orange-400 text-sm font-semibold">
          {lab.category} · {lab.difficulty} · {lab.minutes} min {solved && '· Completed'}
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mt-3">{lab.title}</h1>
        <p className="text-gray-300 mt-4 max-w-3xl">{lab.summary}</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <section className="bg-[#1b2b3c] border border-gray-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-orange-400">Your mission</h2>
          <p className="mt-3 text-gray-300">{lab.objective}</p>
          <form onSubmit={submit} className="mt-6 space-y-5">
            {lab.fields.map((field) => (
              <div key={field.key}>
                <label htmlFor={field.key} className="block mb-2 font-medium">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    id={field.key}
                    rows={5}
                    maxLength={4096}
                    value={values[field.key]}
                    onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                    className="w-full bg-[#0d1b2a] border border-gray-600 rounded-lg p-3 text-white font-mono focus:outline-orange-500"
                  />
                ) : (
                  <input
                    id={field.key}
                    type={field.type || 'text'}
                    maxLength={4096}
                    autoComplete="off"
                    value={values[field.key]}
                    onChange={(event) => setValues({ ...values, [field.key]: event.target.value })}
                    className="w-full bg-[#0d1b2a] border border-gray-600 rounded-lg p-3 text-white focus:outline-orange-500"
                  />
                )}
              </div>
            ))}
            <button className={button} disabled={busy}>
              {busy ? 'Checking…' : 'Run attempt'}
            </button>
          </form>
          <div className="border-t border-gray-600 mt-7 pt-5">
            <h2 className="font-bold">Need a hint?</h2>
            <ol className="list-decimal pl-5 text-gray-300 space-y-3 mt-3">
              {lab.hints.slice(0, hints).map((hint) => (
                <li key={hint}>{hint}</li>
              ))}
            </ol>
            <button
              type="button"
              className="text-orange-400 hover:underline mt-4 disabled:text-gray-500"
              disabled={hints === lab.hints.length}
              onClick={() => setHints((count) => count + 1)}
            >
              {hints === lab.hints.length ? 'All hints revealed' : `Reveal hint ${hints + 1}`}
            </button>
          </div>
        </section>
        <section
          className="bg-[#1b2b3c] border border-gray-700 rounded-xl p-6"
          aria-live="polite"
          aria-busy={busy}
        >
          <h2 className="text-xl font-bold text-orange-400">Lab response</h2>
          {result ? (
            <>
              <p className="mt-4 font-medium">
                {result.completed ? 'Challenge completed! ' : ''}
                {result.feedback}
              </p>
              {result.output && (
                <pre className="mt-4 rounded-lg bg-[#0d1b2a] p-4 text-sm whitespace-pre-wrap break-words overflow-auto">
                  {JSON.stringify(result.output, null, 2)}
                </pre>
              )}
              {result.completed && (
                <div className="mt-5 border-t border-gray-600 pt-5">
                  <p className="text-orange-400 font-mono break-all">{result.flag}</p>
                  <h3 className="font-bold mt-5">How to prevent it</h3>
                  <p className="text-gray-300 mt-2">{lab.lesson}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 mt-4">Run an attempt to inspect the simulated response.</p>
          )}
          <p className="text-gray-400 text-xs mt-6">
            This exercise uses fictional data and simulated behavior. Your input stays within this
            training exercise.
          </p>
        </section>
      </div>
    </>
  );
}
export default function Practice() {
  const router = useRouter();
  const location = router?.location || window.location.pathname;
  const id = location.split(/[?#]/)[0].match(/\/practice\/([^/]+)\/?$/)?.[1];
  const lab = findPracticeLab(id);
  const learner = useLearner();
  const [progress, setProgress] = useState(() => (learner ? {} : readProgress()));
  const [progressMessage, setProgressMessage] = useState('');
  useEffect(() => {
    if (!learner) return;
    const controller = new AbortController();
    fetch(assetUrl('api/account/progress'), { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error();
        if (!controller.signal.aborted)
          setProgress((previous) => ({
            ...previous,
            ...Object.fromEntries(data.completed.map((id) => [id, true])),
          }));
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setProgressMessage('Saved progress could not be loaded. Reload to try again.');
      });
    return () => controller.abort();
  }, [learner]);
  function complete(labId, savedLabs) {
    setProgress((previous) => {
      const next = { ...previous, [labId]: previous[labId] || new Date().toISOString() };
      if (!learner)
        try {
          localStorage.setItem(progressKey, JSON.stringify(next));
        } catch {}
      return next;
    });
  }
  return (
    <div className="min-h-screen bg-[#0d1b2a] text-white">
      <header className="border-b border-gray-700 bg-[#1b2b3c]">
        <nav
          className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-5"
          aria-label="Main navigation"
        >
          <Link to="/" className="text-orange-500 text-xl font-bold">
            Breach Boulevard
          </Link>
          <div className="flex gap-6 text-sm">
            <Link to="/">Home</Link>
            <Link to="/courses">Courses</Link>
            <Link to="/practice" className="text-orange-400">
              Labs
            </Link>
          </div>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        {id ? (
          lab ? (
            <Challenge key={id} lab={lab} solved={Boolean(progress[id])} onComplete={complete} />
          ) : (
            <>
              <h1 className="text-3xl font-bold">Lab not found</h1>
              <Link to="/practice" className="text-orange-400">
                Browse practice labs
              </Link>
            </>
          )
        ) : (
          <>
            <p className="uppercase tracking-widest text-sm text-orange-400 font-semibold">
              Learn by doing
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mt-3">Practice labs</h1>
            <p className="text-gray-300 max-w-2xl mt-4">
              Explore six security challenges, inspect the responses, and learn how to fix each
              weakness. Reveal hints whenever you need them.
            </p>
            <p className="mt-6 text-orange-400" role="status">
              {practiceLabs.filter((item) => progress[item.id]).length} of {practiceLabs.length}{' '}
              completed
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {learner
                ? 'Progress is saved to your account.'
                : 'Progress is saved in this browser.'}
            </p>
            {progressMessage && (
              <p role="alert" className="text-orange-300 text-sm mt-2">
                {progressMessage}
              </p>
            )}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-9">
              {practiceLabs.map((item) => (
                <article
                  key={item.id}
                  className="bg-[#1b2b3c] border border-gray-700 hover:border-orange-500 rounded-xl p-6 flex flex-col"
                >
                  <p className="text-orange-400 text-sm font-semibold">{item.category}</p>
                  <h2 className="text-xl font-bold mt-3">{item.title}</h2>
                  <p className="text-gray-300 mt-3 flex-1">{item.summary}</p>
                  <p className="text-gray-400 text-sm mt-5">
                    {item.difficulty} · {item.minutes} min
                  </p>
                  <Link to={`/practice/${item.id}`} className={`${button} mt-5 text-center`}>
                    {progress[item.id] ? 'Practice again' : 'Start lab'}
                  </Link>
                  {progress[item.id] && (
                    <span className="text-orange-400 text-sm mt-3">Completed ✓</span>
                  )}
                </article>
              ))}
            </div>
          </>
        )}
      </main>
      <footer className="text-center text-gray-400 text-sm px-6 py-8 border-t border-gray-700">
        Breach Boulevard · Build your security skills
      </footer>
    </div>
  );
}
