import React, { useState, useEffect, useRef } from 'react';
import { assetUrl } from '../routing';

const UNAVAILABLE = 'Honey is unavailable right now. Try again in a moment.';

export default function HoneyChat({ labId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const request = useRef(null),
    log = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages, busy]);

  const addHoney = (text, error = false) =>
    setMessages((items) => [...items, { role: 'honey', text, error }]);

  async function send(text) {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((items) => [...items, { role: 'user', text: message }]);
    setDraft('');
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const response = await fetch(assetUrl('api/honey/chat'), {
        method: 'POST',
        credentials: 'same-origin',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, labId, hintIndex }),
      });
      const data = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !data.success) {
        addHoney(data.message || UNAVAILABLE, true);
        return;
      }
      setHintIndex(data.nextHintIndex);
      addHoney(data.reply);
    } catch {
      if (!controller.signal.aborted) addHoney(UNAVAILABLE, true);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return (
    <div className="bb-honey-chat">
      <div ref={log} className="bb-honey-log" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="bb-honey-empty">
            {labId
              ? 'Stuck on this lab? Ask me for one hint at a time.'
              : 'Hi, curious human! Ask me about the labs or how to find your way around.'}
          </p>
        ) : (
          messages.map((item, index) => (
            <p
              key={index}
              className={`bb-honey-msg bb-honey-msg-${item.role}${item.error ? ' is-error' : ''}`}
            >
              <span>{item.role === 'user' ? 'You' : 'Honey'}</span>
              {item.text}
            </p>
          ))
        )}
        {busy ? (
          <p className="bb-honey-msg bb-honey-msg-honey is-typing">
            <span>Honey</span>
            Thinking…
          </p>
        ) : null}
      </div>
      <div className="bb-honey-starters">
        {(labId
          ? ["I'm stuck. What now?", 'Give me the next hint']
          : ['What can I practice?', 'How does this site work?']
        ).map((starter) => (
          <button type="button" key={starter} disabled={busy} onClick={() => send(starter)}>
            {starter}
          </button>
        ))}
      </div>
      <form
        className="bb-honey-form"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <input
          type="text"
          aria-label="Message Honey"
          placeholder={labId ? 'Ask Honey for a hint' : 'Ask Honey a question…'}
          maxLength={500}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" disabled={busy || !draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
