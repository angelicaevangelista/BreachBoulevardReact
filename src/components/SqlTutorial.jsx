import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
const steps = [
  {
    title: 'Step 1',
    description:
      "Enter `'` (single quote) into the username field. This simulates injecting a simple SQL statement to cause an error.",
    action: 'username',
    answer: "'",
    feedback: 'Great! You’ve entered a single quote. Proceed to the next step.',
  },
  {
    title: 'Step 2',
    description:
      'Click the login button to see the result. This simulates attempting to bypass authentication.',
    action: 'submit-btn',
    feedback: 'Login attempt failed. Let’s learn why.',
  },
  {
    title: 'Step 3',
    description:
      "Enter `' OR 1=1--` into the username field. This exploits the SQL query to bypass login authentication.",
    action: 'username',
    answer: "' OR 1=1--",
    feedback: 'Success! You’ve bypassed the login using SQL Injection.',
  },
];
export default function SqlTutorial() {
  const [index, setIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [feedback, setFeedback] = useState('');
  const [position, setPosition] = useState(null);
  const field = useRef(null),
    button = useRef(null),
    card = useRef(null);
  const step = steps[index];
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => {
      setFeedback('');
      setIndex((value) => value + 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [feedback]);
  useLayoutEffect(() => {
    if (!step) return;
    const element = step.action === 'username' ? field.current : button.current;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      setPosition({
        card: {
          top: rect.top + window.scrollY - 230,
          left: rect.left + window.scrollX + rect.width / 2 - card.current.offsetWidth / 2,
        },
        arrow: {
          top: rect.top + window.scrollY - 40,
          left: rect.left + window.scrollX + rect.width / 2 - 15,
        },
      });
    };
    measure();
    if (step.action === 'username') element.focus();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [index]);
  function change(event) {
    setUsername(event.target.value);
    if (step?.action === 'username' && !feedback && event.target.value.trim() === step.answer)
      setFeedback(step.feedback);
  }
  const active = step?.action;
  const fieldClass =
    'w-full p-4 border rounded-lg focus:outline-none focus:ring focus:border-orange-500';
  return (
    <>
      <div id="overlay" className="overlay" />
      <div id="floating-card" ref={card} className="floating-card" style={position?.card}>
        <h2 id="step-title">{step?.title || 'Tutorial Completed!'}</h2>
        <p id="step-description">
          {step?.description || 'You’ve successfully completed the tutorial.'}
        </p>
      </div>
      <div id="arrow" className="arrow" style={position?.arrow} />
      <div className="container relative">
        <h1 className="text-3xl font-bold text-center text-orange-500 mb-8">Login Form</h1>
        <form id="tutorial-form" className="space-y-8" onSubmit={(event) => event.preventDefault()}>
          <div>
            <label htmlFor="username" className="block text-lg font-semibold mb-2">
              Username
            </label>
            <input
              ref={field}
              type="text"
              id="username"
              className={`${fieldClass} ${active === 'username' ? 'highlight' : 'disabled'}`}
              placeholder="Enter Username"
              disabled={active !== 'username'}
              value={username}
              onChange={change}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-lg font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`${fieldClass} disabled`}
              placeholder="Enter Password"
              disabled
            />
          </div>
          <div>
            <button
              type="button"
              ref={button}
              id="submit-btn"
              className={`w-full bg-orange-500 text-white py-4 rounded-lg hover:bg-orange-600 ${active === 'submit-btn' ? 'highlight' : 'disabled'}`}
              disabled={active !== 'submit-btn'}
              onClick={() => {
                if (!feedback && step) setFeedback(step.feedback);
              }}
            >
              Login
            </button>
          </div>
        </form>
        <div id="feedback" className="mt-6 text-center text-lg text-orange-500">
          {feedback}
        </div>
      </div>
    </>
  );
}
