import React, { useEffect, useReducer, useRef, useState } from 'react';

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
  const command = action.command.trim().toLowerCase();
  if (state.quiz) {
    const correct = command === state.quiz[state.index].answer;
    const score = state.score + Number(correct);
    const index = state.index + 1;
    const lines = [
      ...state.lines,
      correct ? 'Correct!' : `Incorrect. The correct answer was: ${state.quiz[state.index].answer}`,
    ];
    if (index < state.quiz.length)
      return { ...state, lines: [...lines, state.quiz[index].question], index, score };
    return {
      ...state,
      quiz: null,
      score,
      lines: [
        ...lines,
        `Quiz completed! Your score: ${score}/3`,
        score === 3
          ? 'Excellent! Now you can proceed exploring breach boulevard.'
          : 'You can do better. Maybe exploring breach boulevard will help.',
      ],
    };
  }
  if (command === 'clear') return { ...state, lines: [], cleared: true };
  const lines = [...state.lines, `> ${command}`];
  if (command === 'quiz')
    return {
      ...state,
      quiz: action.questions,
      index: 0,
      score: 0,
      lines: [
        ...lines,
        'Starting the quiz! Answer the following questions:',
        action.questions[0].question,
      ],
    };
  const message =
    command === 'help'
      ? 'Available commands: help, about, clear, quiz'
      : command === 'about'
        ? 'This terminal simulates a basic hacking interface.'
        : `Unknown command: ${command}`;
  return { ...state, lines: [...lines, message] };
}
export default function QuizTerminal({ welcome, children, autoFocus = false, ...props }) {
  const [state, dispatch] = useReducer(terminalReducer, {
    lines: [],
    quiz: null,
    index: 0,
    score: 0,
  });
  const [input, setInput] = useState('');
  const terminal = useRef(null);
  const field = useRef(null);
  useEffect(() => {
    terminal.current.scrollTop = terminal.current.scrollHeight;
  }, [state.lines]);
  return (
    <div {...props} ref={terminal} onClick={() => field.current?.focus()}>
      {state.lines.length === 0 && !state.quiz && !state.cleared && welcome}
      {state.lines.map((line, index) => (
        <div key={index}>{line}</div>
      ))}
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
            if (event.key !== 'Enter') return;
            event.preventDefault();
            dispatch({
              command: input,
              questions: [...questions].sort(() => Math.random() - 0.5).slice(0, 3),
            });
            setInput('');
          }}
        />
      </div>
    </div>
  );
}
