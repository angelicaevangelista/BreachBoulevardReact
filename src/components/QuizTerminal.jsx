import React, { useEffect, useReducer, useRef, useState } from 'react';
import { Icon } from './Interface';

const fakeFiles = {
  'about.txt': 'Breach Boulevard: a safe street to practice breaking (and fixing) web apps.',
  'notes.md':
    'Reminder: ls, cat, and whoami are just for fun here. The real labs are one click away.',
  'flag.txt': 'Nice try. Flags are earned in the labs, not cat-ed from a demo console.',
};
const bootLines = ['Booting secure shell…', 'Linking to breachblvd.local…', 'Session ready.'];
const helpText =
  'Available commands: help, about, whoami, ls, cat <file>, quiz, hint, score, history, clear';

function lineTone(line) {
  if (line.startsWith('> ')) return 'command';
  if (/^correct!/i.test(line) || /^(excellent|quiz completed)/i.test(line)) return 'success';
  if (/^(incorrect|unknown command|cat: )/i.test(line)) return 'error';
  return 'info';
}

export const questions = [
  {
    question: 'This vulnerability allows attackers to inject malicious SQL commands.',
    answer: 'sql injection',
  },
  {
    question: 'This vulnerability exploits the lack of input validation in web forms.',
    answer: 'xss',
  },
  {
    question: 'This is caused by poor authentication mechanisms.',
    answer: 'broken authentication',
  },
  {
    question: 'Sensitive information is exposed due to improper access controls.',
    answer: 'insecure direct object references',
  },
  {
    question: 'Attackers intercept communication by exploiting security flaws.',
    answer: 'man in the middle',
  },
  {
    question: 'Using outdated or unpatched components leads to this vulnerability.',
    answer: 'using components with known vulnerabilities',
  },
  {
    question: 'Allows attackers to overload systems, denying service to legitimate users.',
    answer: 'denial of service',
  },
  {
    question: 'Poor session management can lead to this vulnerability.',
    answer: 'session hijacking',
  },
  {
    question: 'Sensitive data is exposed in transit due to lack of encryption.',
    answer: 'insecure data transmission',
  },
  {
    question: 'This vulnerability stems from insufficient logging and monitoring.',
    answer: 'insufficient logging and monitoring',
  },
];
export function terminalReducer(state, action) {
  const raw = action.command;
  const command = raw.trim().toLowerCase();
  // Every submitted line (commands and quiz answers alike) feeds the recall
  // list used by the typed `history` command and the input's arrow-key nav.
  state = { ...state, history: command ? [...state.history, raw].slice(-50) : state.history };
  if (state.quiz) {
    if (command === 'hint') {
      const answer = state.quiz[state.index].answer;
      const masked = answer
        .split('')
        .map((char, charIndex) => (charIndex === 0 || char === ' ' ? char : '•'))
        .join('');
      return {
        ...state,
        lines: [
          ...state.lines,
          `> ${raw}`,
          `Hint: ${masked} (${answer.replace(/\s/g, '').length} letters, spaces shown).`,
        ],
      };
    }
    if (command === 'score')
      return {
        ...state,
        lines: [...state.lines, `> ${raw}`, `Score so far: ${state.score}/${state.index}.`],
      };
    const correct = command === state.quiz[state.index].answer;
    const score = state.score + Number(correct);
    const index = state.index + 1;
    const lines = [
      ...state.lines,
      correct ? 'Correct!' : `Incorrect. The correct answer was: ${state.quiz[state.index].answer}`,
    ];
    if (index < state.quiz.length)
      return {
        ...state,
        lines: [
          ...lines,
          `Question ${index + 1} of ${state.quiz.length}: ${state.quiz[index].question}`,
        ],
        index,
        score,
      };
    return {
      ...state,
      quiz: null,
      score,
      lastScore: { score, total: state.quiz.length },
      lines: [
        ...lines,
        `Quiz completed! Your score: ${score}/${state.quiz.length}`,
        score === state.quiz.length
          ? 'Excellent! Now you can proceed exploring breach boulevard.'
          : 'You can do better. Maybe exploring breach boulevard will help.',
      ],
    };
  }
  if (command === 'clear') return { ...state, lines: [], cleared: true };
  const lines = [...state.lines, `> ${raw}`];
  if (command === 'quiz')
    return {
      ...state,
      quiz: action.questions,
      index: 0,
      score: 0,
      lines: [
        ...lines,
        'Starting the quiz! Answer the following questions:',
        `Question 1 of ${action.questions.length}: ${action.questions[0].question}`,
      ],
    };
  if (command === 'whoami')
    return { ...state, lines: [...lines, 'guest@breachblvd — a curious visitor, nothing more.'] };
  if (command === 'ls') return { ...state, lines: [...lines, Object.keys(fakeFiles).join('  ')] };
  const catMatch = command.match(/^cat(?:\s+(.+))?$/);
  if (catMatch) {
    const file = (catMatch[1] || '').trim();
    const message = !file
      ? 'Usage: cat <file>'
      : fakeFiles[file] || `cat: ${file}: No such file or directory`;
    return { ...state, lines: [...lines, message] };
  }
  if (command === 'hint')
    return {
      ...state,
      lines: [...lines, 'Type quiz to start a round, then ask for a hint anytime.'],
    };
  if (command === 'score')
    return {
      ...state,
      lines: [
        ...lines,
        state.lastScore
          ? `Last quiz score: ${state.lastScore.score}/${state.lastScore.total}.`
          : 'No quiz finished yet. Type quiz to get started.',
      ],
    };
  if (command === 'history') {
    const past = state.history.slice(0, -1);
    return {
      ...state,
      lines: [
        ...lines,
        past.length
          ? past.map((entry, entryIndex) => `${entryIndex + 1}. ${entry}`).join('\n')
          : 'No commands yet.',
      ],
    };
  }
  const message =
    command === 'help'
      ? helpText
      : command === 'about'
        ? 'This terminal simulates a basic hacking interface, now a little cozier. Try ls, cat, whoami, or quiz.'
        : `Unknown command: ${command}`;
  return { ...state, lines: [...lines, message] };
}
export default function QuizTerminal({
  welcome,
  children,
  autoFocus = false,
  className = '',
  ...props
}) {
  const [state, dispatch] = useReducer(terminalReducer, {
    lines: [],
    quiz: null,
    index: 0,
    score: 0,
    lastScore: null,
    history: [],
  });
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const [muted, setMuted] = useState(false);
  const body = useRef(null);
  const field = useRef(null);
  const audioContext = useRef(null);
  const historyIndex = useRef(null);
  const draft = useRef('');
  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 650);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    body.current.scrollTop = body.current.scrollHeight;
  }, [state.lines]);
  useEffect(
    () => () => {
      audioContext.current?.close?.();
    },
    []
  );
  function playTone(kind) {
    if (muted) return;
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return;
    try {
      const ctx = (audioContext.current ||= new Context());
      const frequency = kind === 'success' ? 880 : kind === 'error' ? 220 : 440;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      oscillator.connect(gain).connect(ctx.destination);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.17);
    } catch {
      // Audio is a nice-to-have; ignore unsupported or blocked contexts.
    }
  }
  function submit() {
    const trimmed = input.trim().toLowerCase();
    if (state.quiz && trimmed !== 'hint' && trimmed !== 'score') {
      playTone(trimmed === state.quiz[state.index].answer ? 'success' : 'error');
    } else if (trimmed) {
      playTone('neutral');
    }
    dispatch({
      command: input,
      questions: [...questions].sort(() => Math.random() - 0.5).slice(0, 3),
    });
    historyIndex.current = null;
    draft.current = '';
    setInput('');
  }
  function recall(direction) {
    const past = state.history;
    if (!past.length) return;
    if (direction === 'up') {
      if (historyIndex.current === null) {
        draft.current = input;
        historyIndex.current = past.length - 1;
      } else if (historyIndex.current > 0) {
        historyIndex.current -= 1;
      }
      setInput(past[historyIndex.current]);
    } else if (historyIndex.current !== null) {
      if (historyIndex.current < past.length - 1) {
        historyIndex.current += 1;
        setInput(past[historyIndex.current]);
      } else {
        historyIndex.current = null;
        setInput(draft.current);
      }
    }
  }
  return (
    <div className={['bb-term-shell', className].filter(Boolean).join(' ')}>
      <div className="bb-term-titlebar">
        <span className="bb-term-dot bb-term-dot-red" aria-hidden="true" />
        <span className="bb-term-dot bb-term-dot-yellow" aria-hidden="true" />
        <span className="bb-term-dot bb-term-dot-green" aria-hidden="true" />
        <span className="bb-term-titlebar-label">guest@breachblvd:~</span>
        <button
          type="button"
          className="bb-term-mute"
          aria-pressed={muted}
          aria-label={muted ? 'Unmute terminal sounds' : 'Mute terminal sounds'}
          onClick={() => setMuted((value) => !value)}
        >
          <Icon name={muted ? 'mute' : 'volume'} size={14} />
        </button>
      </div>
      <div {...props} ref={body} className="bb-term-body" onClick={() => field.current?.focus()}>
        {state.lines.length === 0 && !state.quiz && !state.cleared && (
          <div className="bb-term-boot">
            {booted ? welcome : bootLines.map((line) => <div key={line}>{line}</div>)}
          </div>
        )}
        {state.lines.map((line, index) => (
          <div key={index} className={`bb-term-line bb-term-line-${lineTone(line)}`}>
            {line}
          </div>
        ))}
        {state.quiz && (
          <div className="bb-term-progress">
            Question {state.index + 1} of {state.quiz.length} · Score {state.score}
          </div>
        )}
        <div className="prompt-line">
          <span aria-hidden="true">&gt;</span>
          <input
            ref={field}
            aria-label="Terminal command"
            className="input-area"
            autoComplete="off"
            autoFocus={autoFocus}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              fontFamily: 'inherit',
              outline: 'none',
              width: '100%',
            }}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                recall('up');
              } else if (event.key === 'ArrowDown') {
                event.preventDefault();
                recall('down');
              } else if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
