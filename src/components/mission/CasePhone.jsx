import React, { useState } from 'react';
import { Link } from '../../routing';
import { Icon } from '../Interface';
import EvidenceReader from './EvidenceReader';
export default function CasePhone({
  caseFile,
  chapter,
  state,
  labDone,
  busy,
  action,
  labUrl,
  note,
  setNote,
  onOpenLab,
}) {
  const [app, setApp] = useState('home'),
    [opened, setOpened] = useState(null);
  const files = chapter.evidence.filter((f) => !f.afterLab || labDone);
  const file = files.find((f) => f.id === opened);
  const filed = state.solved.includes(chapter.id);
  return (
    <aside className="mission-phone-wrap">
      <div className="mission-phone-caption">
        <span>FIELD DEVICE / BLVD-01</span>
        <small>Simulated phone</small>
      </div>
      <div className="mission-phone">
        <div className="mission-phone-screen">
          <div className="mission-phone-status">
            <span>09:41</span>
            <span className="mission-phone-island" />
            <span>
              ▮▮▮ <i />
            </span>
          </div>
          <div className="mission-phone-topbar">
            <button
              type="button"
              aria-label="Phone home"
              onClick={() => {
                setApp('home');
                setOpened(null);
              }}
            >
              <Icon name="back" size={16} />
            </button>
            <strong>
              {app === 'home'
                ? 'Pocket Boulevard'
                : app === 'messages'
                  ? 'Messages'
                  : app === 'files'
                    ? 'Case files'
                    : app === 'notes'
                      ? 'Notebook'
                      : 'Dispatch'}
            </strong>
            <span className="mission-phone-dot" />
          </div>
          <div className="mission-phone-content">
            {app === 'home' ? (
              <div className="mission-phone-home">
                <span>YOUR LITTLE FIELD DESK</span>
                <h3>
                  A new trail
                  <br />
                  is waiting.
                </h3>
                <div className="mission-phone-notification">
                  <Icon name="mail" size={17} />
                  <div>
                    <strong>{chapter.contact}</strong>
                    <p>{chapter.messages[0]}</p>
                  </div>
                </div>
                <div className="mission-phone-apps">
                  {[
                    ['messages', 'mail', 'Messages'],
                    ['files', 'book', 'Files'],
                    ['notes', 'code', 'Notes'],
                    ['dispatch', 'flag', 'Dispatch'],
                  ].map(([id, icon, label]) => (
                    <button type="button" key={id} onClick={() => setApp(id)}>
                      <span>
                        <Icon name={icon} size={23} />
                        {id === 'messages' &&
                          !chapter.replies.some((r) => state.replies.includes(r.id)) && <i />}
                      </span>
                      {label}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="mission-phone-open"
                  onClick={() => setApp('messages')}
                >
                  Read the message
                  <Icon name="arrow" size={14} />
                </button>
                <small>All contacts, messages and files are fictional.</small>
              </div>
            ) : app === 'messages' ? (
              <div className="mission-messages">
                <header>
                  <span className="mission-contact-avatar">
                    <Icon name="heart" size={19} />
                  </span>
                  <div>
                    <strong>{chapter.contact}</strong>
                    <small>Festival network · fictional contact</small>
                  </div>
                </header>
                <span className="mission-message-date">
                  CASE {caseFile.number} · CHAPTER {caseFile.chapters.indexOf(chapter) + 1}
                </span>
                {chapter.messages.map((text, i) => (
                  <p className="mission-message incoming" key={i}>
                    {text}
                  </p>
                ))}
                {state.replies
                  .map((id) => chapter.replies.find((r) => r.id === id))
                  .filter(Boolean)
                  .map((reply) => (
                    <React.Fragment key={reply.id}>
                      <p className="mission-message outgoing">{reply.label}</p>
                      <p className="mission-message incoming">{reply.text}</p>
                    </React.Fragment>
                  ))}
                <div className="mission-reply-choices">
                  <small>ASK A QUESTION</small>
                  {chapter.replies.map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      disabled={busy || state.replies.includes(r.id)}
                      onClick={() =>
                        action({ type: 'reply', chapterId: chapter.id, replyId: r.id })
                      }
                    >
                      {state.replies.includes(r.id) ? '✓ ' : ''}
                      {r.label}
                      <Icon name="arrow" size={12} />
                    </button>
                  ))}
                </div>
              </div>
            ) : app === 'files' ? (
              <div className="mission-phone-files">
                {file ? (
                  <>
                    <button
                      type="button"
                      className="mission-phone-back"
                      onClick={() => setOpened(null)}
                    >
                      ← All chapter files
                    </button>
                    <EvidenceReader
                      key={file.id}
                      file={file}
                      compact
                      pinned={state.pinned.includes(file.id)}
                      filed={filed}
                      busy={busy}
                      onPin={() =>
                        action({
                          type: 'pin',
                          chapterId: chapter.id,
                          evidenceId: file.id,
                          pinned: !state.pinned.includes(file.id),
                        })
                      }
                    />
                  </>
                ) : (
                  <>
                    <span className="mission-device-label">CHAPTER EVIDENCE</span>
                    <p>Open a file. Look closer. Pin what matters.</p>
                    {chapter.evidence.map((f) => (
                      <button
                        type="button"
                        key={f.id}
                        disabled={f.afterLab && !labDone}
                        onClick={() => setOpened(f.id)}
                      >
                        <Icon
                          name={
                            f.afterLab && !labDone ? 'lock' : f.kind === 'photo' ? 'eye' : 'book'
                          }
                          size={18}
                        />
                        <span>
                          <strong>{f.title}</strong>
                          <small>
                            {f.afterLab && !labDone
                              ? 'Recovered after the lab'
                              : state.pinned.includes(f.id)
                                ? 'Pinned to your board'
                                : f.kind}
                          </small>
                        </span>
                        <Icon name="chevron" size={13} />
                      </button>
                    ))}
                  </>
                )}
              </div>
            ) : app === 'notes' ? (
              <div className="mission-phone-notes">
                <span className="mission-device-label">YOUR INVESTIGATION NOTEBOOK</span>
                <h3>
                  Little clues.
                  <br />
                  Big connections.
                </h3>
                <textarea
                  aria-label="Case notebook"
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1200}
                  rows={9}
                  placeholder="What stands out? Which request fields deserve a closer look?"
                />
                <small>
                  {note.length}/1,200 ·{' '}
                  {note === state.note ? 'Saved to your account' : 'Unsaved note'}
                </small>
                <button
                  type="button"
                  className="mission-phone-open"
                  disabled={busy || note === state.note}
                  onClick={() => action({ type: 'note', text: note })}
                >
                  <Icon name="check" size={14} /> Save to case file
                </button>
              </div>
            ) : (
              <div className="mission-phone-dispatch">
                <span className="mission-device-label">HONEY’S FIELD BRIEF</span>
                <span className="mission-dispatch-mark">
                  <Icon name="flag" size={30} />
                </span>
                <h3>{chapter.title}</h3>
                <p>{chapter.brief}</p>
                <ol>
                  <li>Inspect and pin your starting clues.</li>
                  <li>Complete the linked CTF and submit its flag.</li>
                  <li>Recover the final file, then connect the evidence.</li>
                </ol>
                <Link className="mission-phone-open" to={labUrl} onClick={onOpenLab}>
                  {labDone ? 'Revisit linked lab' : 'Open linked lab'}
                  <Icon name="arrow" size={14} />
                </Link>
                <small>Your case desk stays saved while you investigate.</small>
              </div>
            )}
          </div>
          <button
            type="button"
            className="mission-phone-homebar"
            aria-label="Return to phone home screen"
            onClick={() => {
              setApp('home');
              setOpened(null);
            }}
          />
        </div>
      </div>
      <p className="mission-phone-footnote">
        <Icon name="shield" size={12} /> A fictional device. Your real phone stays private.
      </p>
    </aside>
  );
}
