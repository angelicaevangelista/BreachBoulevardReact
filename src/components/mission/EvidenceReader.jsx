import React, { useEffect, useState } from 'react';
import { Icon } from '../Interface';
export default function EvidenceReader({ file, pinned, filed, busy, onPin, compact = false }) {
  const [back, setBack] = useState(false),
    [zoom, setZoom] = useState(false),
    [playing, setPlaying] = useState(false),
    [words, setWords] = useState(0);
  const transcript = file.body.split(' ');
  useEffect(() => {
    if (!playing) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setWords(transcript.length);
      setPlaying(false);
      return;
    }
    const timer = setInterval(() => setWords((n) => Math.min(transcript.length, n + 3)), 260);
    return () => clearInterval(timer);
  }, [playing, transcript.length]);
  useEffect(() => {
    if (words >= transcript.length) setPlaying(false);
  }, [words, transcript.length]);
  return (
    <article
      className={'mission-reader ' + (compact ? 'is-compact' : '')}
      aria-label={file.title + ' evidence'}
    >
      <header>
        <span>{file.tag}</span>
        <small>{file.kind === 'memo' ? 'TRANSCRIPT' : file.kind.toUpperCase()}</small>
      </header>
      <h3>{file.title}</h3>
      {file.kind === 'photo' ? (
        <>
          <div
            className={
              'mission-photo is-' + file.art + (zoom ? ' is-zoomed' : '') + (back ? ' is-back' : '')
            }
          >
            <span className="mission-photo-tape" />
            {back ? (
              <>
                <small>INSPECTION · REVERSE SIDE</small>
                <p>{file.reverse}</p>
                <span className="mission-photo-stamp">EVIDENCE / BLVD</span>
              </>
            ) : (
              <>
                <span className="mission-photo-moon" />
                <div className="mission-photo-buildings">
                  <i />
                  <i />
                  <i />
                </div>
                <strong>{file.body}</strong>
                <span className="mission-photo-grain" />
              </>
            )}
          </div>
          <div className="mission-reader-tools">
            <button type="button" aria-pressed={back} onClick={() => setBack((v) => !v)}>
              <Icon name="refresh" size={13} />
              {back ? 'Front of photo' : 'Turn over'}
            </button>
            <button type="button" aria-pressed={zoom} onClick={() => setZoom((v) => !v)}>
              <Icon name="search" size={13} />
              {zoom ? 'Zoom out' : 'Inspect closer'}
            </button>
          </div>
          <small>
            {file.caption || 'A supplied fictional image. Inspect both sides for a clue.'}
          </small>
        </>
      ) : file.kind === 'memo' ? (
        <div className="mission-voice">
          <div className={'mission-wave ' + (playing ? 'is-playing' : '')} aria-hidden="true">
            {[12, 26, 17, 34, 22, 41, 26, 15, 32, 22, 38, 17, 29, 15].map((h, i) => (
              <i key={i} style={{ height: h, '--i': i }} />
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              if (words === transcript.length) setWords(0);
              setPlaying((v) => !v);
            }}
          >
            {playing
              ? 'Pause replay'
              : words === transcript.length
                ? 'Replay transcript'
                : 'Play silent transcript'}
          </button>
          <p>
            {playing || words > 0
              ? transcript.slice(0, words).join(' ')
              : 'Read the transcript below, or replay its captions.'}
            <span className="mission-voice-caret" hidden={!playing}>
              ▌
            </span>
          </p>
          <details>
            <summary>Full transcript</summary>
            <p>{file.body}</p>
          </details>
          <small>Silent caption replay. No audio or microphone access.</small>
        </div>
      ) : file.kind === 'email' ? (
        <div className="mission-email">
          <dl>
            <div>
              <dt>From</dt>
              <dd>{file.from}</dd>
            </div>
            <div>
              <dt>Subject</dt>
              <dd>{file.subject}</dd>
            </div>
          </dl>
          <p>{file.body}</p>
        </div>
      ) : (
        <pre className={file.kind === 'receipt' ? 'mission-receipt' : 'mission-log'}>
          {file.body}
        </pre>
      )}
      <button
        type="button"
        className={'mission-pin-button ' + (pinned ? 'is-pinned' : '')}
        onClick={onPin}
        disabled={busy || filed}
        aria-pressed={pinned}
      >
        <Icon name={pinned ? 'check' : 'flag'} size={15} />
        {filed
          ? 'Filed with this chapter'
          : pinned
            ? 'Pinned · tap to unpin'
            : 'Pin to evidence board'}
      </button>
    </article>
  );
}
