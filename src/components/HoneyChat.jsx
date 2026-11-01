import React, { useState } from 'react';
import { assetUrl } from '../routing';

const UNAVAILABLE = 'Honey is unavailable right now. Try again in a moment.';
const STARTERS = ["I'm stuck. What now?", 'Give me the next hint'];

export default function HoneyChat({ labId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [hintIndex, setHintIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const addHoney = (text, error = false) =>
    setMessages((items) => [...items, { role: 'honey', text, error }]);

  async function send(text) {
    const message = text.trim();
    if (!message || busy) return;
    setMessages((items) => [...items, { role: 'user', text: message }]);
    setDraft('');
    setBusy(true);
    try {
      const response = await fetch(assetUrl('api/honey/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, labId, hintIndex }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        addHoney(data.message || UNAVAILABLE, true);
        return;
      }
      setHintIndex(data.nextHintIndex);
      addHoney(data.reply);
    } catch {
      addHoney(UNAVAILABLE, true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bb-honey-chat">
      <div className="bb-honey-log" role="log" aria-live="polite">
        {messages.length === 0 ? (
          <p className="bb-honey-empty">Stuck on this lab? Ask Honey for one hint at a time.</p>
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
        {STARTERS.map((starter) => (
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
          placeholder="Ask Honey for a hint"
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
