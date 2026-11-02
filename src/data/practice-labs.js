import { ctfLabs } from './ctf-labs.js';
export const practiceLabs = [
  {
    id: 'sql-injection',
    title: 'Break the login query',
    category: 'SQL Injection',
    difficulty: 'Beginner',
    minutes: 8,
    summary: 'Change the logic of a simulated login query using an untrusted input.',
    objective: 'Make the login condition true without knowing the password.',
    fields: [
      { key: 'username', label: 'Username', initial: '' },
      { key: 'password', label: 'Password', type: 'password', initial: '' },
    ],
    hints: [
      'Look at how your input appears inside the query.',
      'A single quote can end a quoted SQL value.',
      "Try an always-true condition such as ' OR '1'='1.",
    ],
    lesson: 'Use parameterized queries. Data should never become SQL syntax.',
  },
  {
    id: 'xss',
    title: 'Find the unsafe comment sink',
    category: 'Cross-Site Scripting',
    difficulty: 'Beginner',
    minutes: 8,
    summary: 'Inspect a comment preview that treats text as executable markup.',
    objective:
      'Submit markup that would trigger an alert in an unsafe comment renderer. Execution is simulated.',
    fields: [
      {
        key: 'payload',
        label: 'Comment HTML',
        type: 'textarea',
        initial: 'Hello, Breach Boulevard!',
      },
    ],
    hints: [
      'The sink interprets HTML instead of plain text.',
      'Script tags and event-handler attributes can introduce script execution.',
      'A training example is <img src=x onerror=alert(1)>.',
    ],
    lesson:
      'Render untrusted comments as text. Apply context-appropriate output encoding and a restrictive Content Security Policy.',
  },
  {
    id: 'authentication',
    title: 'Discover the default password',
    category: 'Authentication',
    difficulty: 'Beginner',
    minutes: 6,
    summary: 'A training account was deployed with an unchanged default password.',
    objective: 'Sign in to the fictional trainee account using its weak default password.',
    fields: [
      { key: 'username', label: 'Username', initial: 'trainee' },
      { key: 'password', label: 'Password', type: 'password', initial: '' },
    ],
    hints: [
      'The account is called trainee.',
      'The deployment guide used a welcome message followed by a common three-digit sequence.',
      'The default password in this fictional exercise is welcome123.',
    ],
    lesson:
      'Remove default credentials, require strong passwords, and apply rate limits and multifactor authentication.',
  },
  {
    id: 'idor',
    title: 'Read the other invoice',
    category: 'IDOR',
    difficulty: 'Beginner',
    minutes: 7,
    summary: 'An invoice lookup trusts an object ID without checking its owner.',
    objective: 'Retrieve a fictional invoice belonging to a different account.',
    fields: [{ key: 'invoiceId', label: 'Invoice ID', type: 'number', initial: '101' }],
    hints: [
      'Invoice 101 belongs to the current training account.',
      'Object IDs are sequential.',
      'Try the next invoice: 102.',
    ],
    lesson:
      'Check object-level authorization on every request. Knowing an ID must not grant permission to read it.',
  },
  {
    id: 'path-traversal',
    title: 'Escape the public folder',
    category: 'Path Traversal',
    difficulty: 'Intermediate',
    minutes: 10,
    summary: 'A simulated file viewer joins a requested filename to a public directory.',
    objective:
      'Read /app/secrets/mission.txt from a viewer rooted at /app/public. Only fictional files are available.',
    fields: [{ key: 'filename', label: 'Filename', initial: 'welcome.txt' }],
    hints: [
      'The public folder contains welcome.txt.',
      'Two dots move to the parent directory.',
      'Try ../secrets/mission.txt.',
    ],
    lesson:
      'Normalize paths, enforce an allowed root, and check authorization before reading files.',
  },
  {
    id: 'data-exposure',
    title: 'Inspect debug data',
    category: 'Sensitive Data Exposure',
    difficulty: 'Beginner',
    minutes: 6,
    summary: 'A fictional profile endpoint returns extra fields when debug mode is enabled.',
    objective: 'Find the debug parameter that exposes a demo-only API key.',
    fields: [{ key: 'endpoint', label: 'API path', initial: '/profile' }],
    hints: [
      'The profile response has an optional debug mode.',
      'Try a boolean query parameter.',
      'Request /profile?debug=true.',
    ],
    lesson: 'Remove debugging fields from public responses and keep privileged keys on the server.',
  },
];
const platforms = [
  {
    name: 'Gatehouse',
    kind: 'login',
    accent: '#e7b083',
    domain: 'gatehouse.lab.invalid',
    tagline: 'Your team’s front door.',
  },
  {
    name: 'Chatterbox',
    kind: 'social',
    accent: '#ad9ce7',
    domain: 'chatterbox.lab.invalid',
    tagline: 'A little more connected.',
  },
  {
    name: 'HuddleHQ',
    kind: 'meeting',
    accent: '#85bbd5',
    domain: 'huddlehq.lab.invalid',
    tagline: 'Make room for a good conversation.',
  },
  {
    name: 'InvoicePilot',
    kind: 'invoice',
    accent: '#93c7b2',
    domain: 'invoicepilot.lab.invalid',
    tagline: 'Keep the little details in order.',
  },
  {
    name: 'Cabinet',
    kind: 'files',
    accent: '#d5b87f',
    domain: 'cabinet.lab.invalid',
    tagline: 'Everything in its little place.',
  },
  {
    name: 'Stride',
    kind: 'fitness',
    accent: '#e99caa',
    domain: 'stride.lab.invalid',
    tagline: 'A small step towards a stronger you.',
  },
];
practiceLabs.forEach((lab, index) => {
  lab.track = 'guided';
  lab.platform = platforms[index];
});
practiceLabs.push(...ctfLabs);
export const findPracticeLab = (id) => practiceLabs.find((lab) => lab.id === id);
