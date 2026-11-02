import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon, Mascot } from './Interface';
import HoneyChat from './HoneyChat';
import { useRouter } from '../routing';
import { accountRequest } from './LearnerGate';

export default function HoneyAssistant() {
  const [open, setOpen] = useState(false);
  const id = useId(),
    panel = useRef(null),
    launcher = useRef(null);
  const router = useRouter();
  const path = (router?.location || window.location.pathname).split(/[?#]/)[0];
  const labId =
    path.match(/\/practice\/([a-z-]+)\/?$/)?.[1] ||
    {
      '/labs/xss': 'xss',
      '/labs/dom-xss': 'xss',
      '/labs/reflected-xss': 'xss',
      '/labs/union-sql': 'sql-injection',
      '/labs/error-sql': 'sql-injection',
      '/labs/idor': 'idor',
      '/tutorial/sql-injection': 'sql-injection',
    }[path];
  useEffect(() => {
    if (open) panel.current?.querySelector('input')?.focus();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    function escape(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        launcher.current?.focus();
      }
    }
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  function close() {
    setOpen(false);
    launcher.current?.focus();
  }
  return (
    <aside className="bb-ui bb-assistant" aria-label="Honey assistant">
      {open && (
        <section
          ref={panel}
          id={id}
          className="bb-assistant-panel"
          role="dialog"
          aria-label="Chat with Honey"
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              close();
            }
          }}
        >
          <header>
            <Mascot compact />
            <div>
              <h2>
                Hey, I’m Honey<span className="bb-orange">.</span>
              </h2>
              <p>Your little guide to the Boulevard</p>
            </div>
            <button
              className="bb-icon-button"
              type="button"
              onClick={close}
              aria-label="Close Honey chat"
            >
              <Icon name="close" size={18} />
            </button>
          </header>
          <p className="bb-assistant-context">
            <Icon name="shield" size={14} />
            {labId
              ? 'A little hint for the lab you’re exploring.'
              : 'A friendly hello, a little cheer, or your next clue.'}
          </p>
          <HoneyChat key={labId || 'platform'} labId={labId} />
          <p className="bb-assistant-footer">A little curiosity goes a long way.</p>
        </section>
      )}
      <button
        type="button"
        ref={launcher}
        className="bb-assistant-launcher"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Minimize Honey chat' : 'Ask Honey'}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
      >
        <Mascot compact />
        <span>
          {open ? 'Honey’s here' : 'Ask Honey'}
          <small>{open ? 'Click to minimize' : 'A little help, always here'}</small>
        </span>
        <Icon name={open ? 'close' : 'spark'} size={18} />
      </button>
    </aside>
  );
}

// Public pages stay public; only a verified signed-in session reveals the helper.
export function PublicHoneyAssistant() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    let controller;
    function check() {
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      accountRequest('session', undefined, signal)
        .then((data) => {
          if (!signal.aborted) setSignedIn(Boolean(data.user));
        })
        .catch(() => {
          if (!signal.aborted) setSignedIn(false);
        });
    }
    check();
    window.addEventListener('focus', check);
    return () => {
      controller?.abort();
      window.removeEventListener('focus', check);
    };
  }, []);
  return signedIn ? <HoneyAssistant /> : null;
}
