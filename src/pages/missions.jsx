import React, { useEffect, useState, useRef } from 'react';
import AppShell, { Icon } from '../components/Interface';
import { Link, useRouter, assetUrl } from '../routing';
import { missionCases, findMission, emptyMissionState, missionStage } from '../data/missions';
import { findPracticeLab } from '../data/practice-labs';
import useMissionDesk from '../hooks/useMissionDesk';
import CasePhone from '../components/mission/CasePhone';
import EvidenceReader from '../components/mission/EvidenceReader';
function CaseDesk({ caseFile, chapter, record, desk, note, setNote }) {
  const [view, setView] = useState('board'),
    [selected, setSelected] = useState(chapter.evidence[0].id),
    [choice, setChoice] = useState('');
  const reader = useRef(null);
  const router = useRouter(),
    state = record.state;
  const index = caseFile.chapters.indexOf(chapter),
    lab = findPracticeLab(chapter.labId),
    labDone = desk.completed.includes(chapter.labId),
    filed = state.solved.includes(chapter.id),
    closed = state.solved.length === 3;
  const labUrl = `/practice/${chapter.labId}?mission=${caseFile.id}&chapter=${chapter.id}`;
  const file =
    chapter.evidence.find((f) => f.id === selected && (!f.afterLab || labDone)) ||
    chapter.evidence[0];
  const pinned = chapter.evidence.filter((e) => state.pinned.includes(e.id)).length;
  const act = (input) => desk.action(caseFile.id, input);
  const ready = labDone && pinned === chapter.evidence.length;
  async function openLab(event) {
    if (desk.busy) {
      event.preventDefault();
      return;
    }
    if (note !== state.note) {
      event.preventDefault();
      const saved = await act({ type: 'note', text: note });
      if (saved) router.navigate(labUrl);
    }
  }
  return (
    <>
      <div className="mission-chapter-strip" aria-label="Case chapters">
        {caseFile.chapters.map((c, i) => {
          const unlocked = i <= state.solved.length;
          return (
            <Link
              key={c.id}
              className={
                (i === index ? 'is-current ' : '') +
                (state.solved.includes(c.id) ? 'is-filed ' : '') +
                (!unlocked ? 'is-locked' : '')
              }
              to={`/missions?case=${caseFile.id}&chapter=${i + 1}`}
              onClick={(e) => {
                if (!unlocked) e.preventDefault();
              }}
              aria-disabled={!unlocked}
              aria-current={i === index ? 'step' : undefined}
            >
              <span>
                {state.solved.includes(c.id) ? (
                  <Icon name="check" size={16} />
                ) : !unlocked ? (
                  <Icon name="lock" size={14} />
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>
              <div>
                <small>
                  {state.solved.includes(c.id)
                    ? 'FILED'
                    : unlocked
                      ? 'CHAPTER ' + (i + 1)
                      : 'LOCKED CHAPTER'}
                </small>
                <strong>{c.title}</strong>
              </div>
              <Icon name="chevron" size={14} />
            </Link>
          );
        })}
      </div>
      {closed && (
        <section className="mission-case-closed" role="status">
          <span className="mission-closed-seal">
            <Icon name="check" size={29} />
          </span>
          <div>
            <span className="bb-eyebrow">CASE {caseFile.number} / CLOSED</span>
            <h2>A little curiosity solved a big mystery.</h2>
            <p>{caseFile.ending}</p>
          </div>
          <span className="mission-filed-stamp">
            FILED
            <br />
            <small>BY A CURIOUS HUMAN</small>
          </span>
        </section>
      )}
      <div className="mission-desk-grid">
        <div className="mission-board-area">
          <section className="mission-brief">
            <div>
              <span className="bb-eyebrow">
                CHAPTER {index + 1} · {chapter.location}
              </span>
              <h2>{chapter.title}</h2>
              <p>{chapter.brief}</p>
            </div>
            <span className={'mission-case-status ' + (filed ? 'is-filed' : '')}>
              {filed ? 'Chapter filed' : labDone ? 'Final clue recovered' : 'Investigation open'}
            </span>
          </section>
          <div className="mission-board-tabs" aria-label="Case desk view">
            {[
              ['board', 'Evidence board', 'flag'],
              ['files', 'Case files', 'book'],
              ['timeline', 'Timeline', 'clock'],
            ].map(([id, label, icon]) => (
              <button type="button" key={id} onClick={() => setView(id)} aria-pressed={view === id}>
                <Icon name={icon} size={15} />
                {label}
              </button>
            ))}
          </div>
          {view === 'timeline' ? (
            <section className="mission-timeline">
              <span className="mission-desk-label">THE TRAIL SO FAR</span>
              {caseFile.chapters.map((c, i) => (
                <div key={c.id} className={state.solved.includes(c.id) ? 'is-filed' : ''}>
                  <span>
                    {state.solved.includes(c.id) ? (
                      <Icon name="check" size={16} />
                    ) : (
                      String(i + 1).padStart(2, '0')
                    )}
                  </span>
                  <div>
                    <small>{c.location}</small>
                    <h3>{c.title}</h3>
                    <p>
                      {i <= state.solved.length
                        ? c.brief
                        : 'A new lead arrives when you file the previous chapter.'}
                    </p>
                    <strong>
                      {state.solved.includes(c.id)
                        ? 'Deduction confirmed'
                        : i === state.solved.length
                          ? 'Your current lead'
                          : 'Not yet investigated'}
                    </strong>
                  </div>
                </div>
              ))}
            </section>
          ) : (
            <section
              className={'mission-evidence-board ' + (view === 'files' ? 'is-file-list' : '')}
              aria-label="Chapter evidence board"
            >
              <div className="mission-board-counter">
                <span>{view === 'board' ? 'CONNECT THE LITTLE THINGS' : 'YOUR CHAPTER FILES'}</span>
                <small>{pinned} / 3 clues pinned</small>
              </div>
              <div className="mission-evidence-cards">
                {view === 'board' && (
                  <svg
                    className={'mission-clue-strings ' + (pinned === 3 ? 'is-connected' : '')}
                    viewBox="0 0 600 140"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path d="M95 75Q220 135 300 50T505 75M95 80Q290-20 505 80" />
                  </svg>
                )}
                {chapter.evidence.map((e, i) => {
                  const locked = e.afterLab && !labDone;
                  return (
                    <button
                      type="button"
                      key={e.id}
                      style={{ '--tilt': `${[-2, 1, 2][i]}deg` }}
                      className={
                        'mission-evidence-card ' +
                        (selected === e.id ? 'is-selected ' : '') +
                        (state.pinned.includes(e.id) ? 'is-pinned ' : '') +
                        (locked ? 'is-locked' : '')
                      }
                      disabled={locked}
                      aria-pressed={selected === e.id}
                      onClick={() => {
                        setSelected(e.id);
                        window.requestAnimationFrame(() => {
                          reader.current?.scrollIntoView({
                            behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')
                              .matches
                              ? 'auto'
                              : 'smooth',
                            block: 'nearest',
                          });
                          reader.current?.focus({ preventScroll: true });
                        });
                      }}
                    >
                      <span className="mission-evidence-pin" />
                      <small>{locked ? 'RECOVER IN THE LAB' : e.kind.toUpperCase()}</small>
                      <Icon
                        name={
                          locked
                            ? 'lock'
                            : e.kind === 'photo'
                              ? 'eye'
                              : e.kind === 'memo'
                                ? 'volume'
                                : 'book'
                        }
                        size={25}
                      />
                      <strong>{e.title}</strong>
                      <span>
                        {locked
                          ? 'Solve the linked CTF first'
                          : state.pinned.includes(e.id)
                            ? '✓ Pinned to your board'
                            : 'Open and inspect'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mission-board-caption">
                <Icon name="search" size={14} />
                {ready
                  ? 'The pieces are here. What connects them?'
                  : 'Read your files, ask your contact, and follow the linked lab.'}
              </div>
            </section>
          )}
          <div
            className="mission-reader-grid"
            ref={reader}
            tabIndex={-1}
            aria-label="Open evidence document"
          >
            <EvidenceReader
              key={file.id}
              file={file}
              busy={desk.busy}
              pinned={state.pinned.includes(file.id)}
              filed={filed}
              onPin={() =>
                act({
                  type: 'pin',
                  chapterId: chapter.id,
                  evidenceId: file.id,
                  pinned: !state.pinned.includes(file.id),
                })
              }
            />
            <section className="mission-lab-ticket">
              <span className="mission-desk-label">YOUR NEXT FIELD VISIT</span>
              <span className="mission-ticket-icon">
                <Icon name="flask" size={27} />
              </span>
              <small>
                {lab.platform.name} · {lab.difficulty} CTF
              </small>
              <h3>{lab.title}</h3>
              <p>{lab.objective}</p>
              <Link className="bb-button bb-button-primary" to={labUrl} onClick={openLab}>
                {labDone ? 'Revisit the lab' : 'Investigate this website'}
                <Icon name="arrow" size={15} />
              </Link>
              <span className={'mission-lab-check ' + (labDone ? 'is-done' : '')}>
                <Icon name={labDone ? 'check' : 'flag'} size={14} />
                {labDone
                  ? 'Linked lab completed · flag submitted'
                  : 'Submit the lab’s flag to recover your last file.'}
              </span>
              <p className="mission-ticket-note">
                Your case stays saved. A return link follows you into the lab.
              </p>
            </section>
          </div>
          <section
            className={'mission-deduction ' + (filed ? 'is-filed' : '')}
            aria-labelledby="deduction-title"
          >
            <div>
              <span className="mission-desk-label">
                {filed ? 'CHAPTER REPORT' : 'CONNECT THE EVIDENCE'}
              </span>
              <h3 id="deduction-title">
                {filed ? 'This chapter is in the case file.' : chapter.question}
              </h3>
              <p>
                {filed
                  ? 'Your deduction is saved to your account. Follow the next message or revisit your evidence.'
                  : ready
                    ? 'Choose the explanation that fits the complete trail.'
                    : 'Pin all three clues and complete the linked CTF before filing your deduction.'}
              </p>
            </div>
            {!filed && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await act({ type: 'deduce', chapterId: chapter.id, choiceId: choice });
                }}
              >
                <fieldset disabled={!ready || desk.busy}>
                  <legend className="sr-only">Your deduction</legend>
                  {chapter.choices.map((c) => (
                    <label key={c.id}>
                      <input
                        type="radio"
                        name="deduction"
                        value={c.id}
                        checked={choice === c.id}
                        onChange={() => setChoice(c.id)}
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                  <button
                    type="submit"
                    className="bb-button bb-button-primary"
                    disabled={!choice || !ready || desk.busy}
                  >
                    File my deduction
                    <Icon name="check" size={15} />
                  </button>
                </fieldset>
              </form>
            )}
            {desk.feedback?.caseId === caseFile.id && (
              <p
                className={
                  'mission-feedback ' + (desk.feedback.correct === false ? 'is-wrong' : '')
                }
                role="status"
              >
                {desk.feedback.feedback}
              </p>
            )}
            {filed && index < 2 && (
              <Link
                className="bb-button bb-button-soft"
                to={`/missions?case=${caseFile.id}&chapter=${index + 2}`}
              >
                Open the next message
                <Icon name="arrow" size={15} />
              </Link>
            )}
            {closed && (
              <Link
                className="bb-button bb-button-soft"
                to={`/missions?case=${missionCases[(missionCases.indexOf(caseFile) + 1) % missionCases.length].id}`}
              >
                Open another case
                <Icon name="arrow" size={15} />
              </Link>
            )}
          </section>
        </div>
        <CasePhone
          key={chapter.id}
          caseFile={caseFile}
          chapter={chapter}
          state={state}
          labDone={labDone}
          busy={desk.busy}
          action={act}
          labUrl={labUrl}
          note={note}
          setNote={setNote}
          onOpenLab={openLab}
        />
      </div>
    </>
  );
}
export default function Missions() {
  const desk = useMissionDesk(),
    router = useRouter();
  const params = new URLSearchParams(
    (router?.location || window.location.search).split('?')[1] || ''
  );
  const caseFile = findMission(params.get('case')) || missionCases[0];
  const record = desk.cases.find((c) => c.caseId === caseFile.id) || {
    revision: 0,
    state: emptyMissionState(),
  };
  const requested = Number(params.get('chapter') || missionStage(caseFile, record.state) + 1) - 1;
  const chapter =
    caseFile.chapters[
      Math.min(
        Math.max(Number.isFinite(requested) ? Math.floor(requested) : 0, 0),
        missionStage(caseFile, record.state)
      )
    ];
  const [drafts, setDrafts] = useState({});
  useEffect(() => {
    if (desk.loading || !desk.cases.length || !router) return;
    const canonical = `/missions?case=${caseFile.id}&chapter=${caseFile.chapters.indexOf(chapter) + 1}`;
    if (router.location !== assetUrl(canonical)) router.navigate(canonical, { replace: true });
  }, [desk.loading, desk.cases.length, caseFile.id, chapter.id, router?.location]);
  return (
    <AppShell title="Story missions" active="missions" showSidebarBuddy={false}>
      <div className="mission-workspace">
        <div className="mission-page-heading">
          <div>
            <span className="bb-eyebrow">
              <Icon name="search" size={14} /> THE BOULEVARD CASE DESK
            </span>
            <h1>Every little clue has a story.</h1>
            <p>Open your phone. Turn over a file. Connect a trail across the Boulevard.</p>
          </div>
          <span className="mission-saved-tag">
            <Icon name="shield" size={14} />
            {desk.busy
              ? 'Saving your case…'
              : desk.loading
                ? 'Opening your drawer…'
                : 'Private case desk · account saved'}
          </span>
        </div>
        <div className="mission-case-selector" aria-label="Choose a story case">
          {missionCases.map((c) => {
            const progress = desk.cases.find((r) => r.caseId === c.id)?.state.solved.length || 0;
            return (
              <Link
                key={c.id}
                to={`/missions?case=${c.id}`}
                className={
                  'mission-folder is-' + c.color + (c.id === caseFile.id ? ' is-active' : '')
                }
                aria-current={c.id === caseFile.id ? 'page' : undefined}
              >
                <span>
                  CASE / {c.number}
                  <i>{progress === 3 ? 'CLOSED' : c.difficulty}</i>
                </span>
                <h2>{c.title}</h2>
                <p>{c.label}</p>
                <div>
                  <span>{desk.loading ? 'Loading…' : `${progress} / 3 chapters filed`}</span>
                  <Icon name={progress === 3 ? 'check' : 'arrow'} size={17} />
                </div>
              </Link>
            );
          })}
        </div>
        {desk.error && (
          <div className="mission-error" role="alert">
            <Icon name="help" size={17} />
            <p>{desk.error}</p>
            <button type="button" onClick={desk.reload} disabled={desk.loading}>
              Refresh case desk
            </button>
          </div>
        )}
        {desk.loading && !desk.cases.length ? (
          <div className="mission-loading" role="status">
            <Icon name="book" size={32} />
            <h2>Unpacking your little field kit…</h2>
            <p>Finding your messages, clues, and saved case notes.</p>
          </div>
        ) : !desk.cases.length && desk.error ? (
          <div className="mission-loading">
            <h2>Your case files are safe.</h2>
            <p>Reconnect and refresh the desk to continue your investigation.</p>
          </div>
        ) : (
          <>
            <div className="mission-dispatch-strip">
              <Icon name="mail" size={17} />
              <p>
                <strong>Dispatch:</strong> {caseFile.dispatch}
              </p>
              <span>{caseFile.minutes} min · 3 linked CTFs</span>
            </div>
            <CaseDesk
              key={caseFile.id + ':' + chapter.id}
              caseFile={caseFile}
              chapter={chapter}
              record={record}
              desk={desk}
              note={drafts[caseFile.id] ?? record.state.note}
              setNote={(text) => setDrafts((old) => ({ ...old, [caseFile.id]: text }))}
            />
          </>
        )}
        <p className="mission-safety-note">
          <Icon name="shield" size={13} /> All people, companies, messages, photos and transactions
          in these stories are fictional. Device controls use supplied content, never your camera,
          microphone or contacts.
        </p>
      </div>
    </AppShell>
  );
}
