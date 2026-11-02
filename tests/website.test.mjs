import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';
import { practiceStreak } from '../server/streaks.mjs';

const pages = JSON.parse(fs.readFileSync('src/pages.json', 'utf8'));
const built = await build({
  stdin: {
    contents: `
import React,{act,StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import registry from './src/registry.js';
import App from './src/App.jsx';
import {Router,navigate,configureBase,resolvePage,routePaths} from './src/routing.jsx';
window.IS_REACT_ACT_ENVIRONMENT=true;
let root;
window.harness={act,navigate,configureBase,resolvePage,routePaths,
  async mount(source,app=false){root=createRoot(document.getElementById('root'));await act(async()=>root.render(<StrictMode>{app?<Router><App/></Router>:React.createElement(registry[source])}</StrictMode>));},
  async unmount(){await act(async()=>root.unmount());}
};`,
    resolveDir: process.cwd(),
    loader: 'jsx',
  },
  bundle: true,
  external: ['three', 'three/*'],
  write: false,
  format: 'iife',
  platform: 'browser',
  define: { 'process.env.NODE_ENV': '"development"' },
});
const bundle = built.outputFiles[0].text;
async function open(
  source,
  {
    fetch,
    app = false,
    url = 'http://localhost/' + source,
    base = '',
    user = { id: 'student-1', email: 'student@example.com' },
    progress = [],
    streak = null,
    optionsFailure = false,
    intervals = null,
    reducedMotion = false,
  } = {}
) {
  const errors = [],
    alerts = [],
    requests = [];
  const console = new VirtualConsole();
  console.on('jsdomError', (error) => errors.push(error.message));
  const dom = new JSDOM(
    '<!doctype html><html><head><title>Test</title></head><body><div id="root" style="display:contents"></div></body></html>',
    { url, runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: console }
  );
  const w = dom.window,
    d = w.document;
  if (intervals) {
    w.setInterval = (callback, delay) => {
      const id = intervals.size + 1;
      intervals.set(id, { callback, delay });
      return id;
    };
    w.clearInterval = (id) => intervals.delete(id);
  }
  if (reducedMotion) {
    w.matchMedia = () => ({
      matches: true,
      addEventListener() {},
      removeEventListener() {},
    });
  }
  w.scrollTo = () => {};
  w.MessageChannel = class {
    port1 = { onmessage: null };
    port2 = { postMessage: () => setTimeout(() => this.port1.onmessage?.(), 0) };
  };
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.alert = (value) => alerts.push(value);
  w.fetch = async (...args) => {
    if (app && optionsFailure && args[0] === base + '/api/auth/options')
      throw new Error('Options temporarily unavailable');
    if (app && args[0] === base + '/api/auth/session')
      return { ok: true, json: async () => ({ success: true, user }) };
    if (app && args[0] === base + '/api/auth/options')
      return {
        ok: true,
        json: async () => ({
          success: true,
          googleEnabled: true,
          emailEnabled: true,
          signupEnabled: true,
        }),
      };
    if (app && args[0] === base + '/api/account/progress')
      return { ok: true, json: async () => ({ success: true, completed: progress, streak }) };
    requests.push(args);
    if (!fetch) throw new Error('Unexpected network request');
    return fetch(...args);
  };
  w.eval(bundle);
  w.harness.configureBase(base);
  await w.harness.mount(source, app);
  const act = (callback) => w.harness.act(async () => callback());
  const fill = (selector, value) =>
    act(() => {
      const field = typeof selector === 'string' ? d.querySelector(selector) : selector;
      const proto =
        field.tagName === 'TEXTAREA'
          ? w.HTMLTextAreaElement.prototype
          : w.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, 'value').set.call(field, value);
      field.dispatchEvent(new w.Event('input', { bubbles: true }));
    });
  const click = (selector) =>
    act(() => (typeof selector === 'string' ? d.querySelector(selector) : selector).click());
  const submit = (selector) =>
    act(() =>
      d
        .querySelector(selector)
        .dispatchEvent(new w.Event('submit', { bubbles: true, cancelable: true }))
    );
  const enter = (selector) =>
    act(() =>
      d
        .querySelector(selector)
        .dispatchEvent(
          new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
        )
    );
  const close = async () => {
    await w.harness.unmount();
    dom.window.close();
  };
  return { dom, w, d, errors, alerts, requests, act, fill, click, submit, enter, close };
}
for (const page of pages) {
  test(`StrictMode mounts and unmounts ${page.path}`, async () => {
    const s = await open(page.path);
    assert.deepEqual(s.errors, []);
    await s.close();
  });
}
test('privacy notice is public without an account and links back to the website', async () => {
  const s = await open('privacy.html', { app: true, url: 'http://localhost/privacy', user: null });
  assert.equal(s.d.querySelector('h1').textContent, 'Privacy notice');
  assert.match(s.d.body.textContent, /OpenID, email, and profile/);
  assert.equal(s.d.querySelector('a[href="/"]').textContent, 'Breach Boulevard');
  assert.deepEqual(s.requests, []);
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('practice catalog, hints, feedback and completion survive navigation', async () => {
  const saved = [];
  const s = await open('practice.html', {
    progress: saved,
    app: true,
    url: 'http://localhost/practice',
    fetch: async () => {
      saved.push('idor');
      return {
        ok: true,
        json: async () => ({
          success: true,
          completed: true,
          feedback: 'Invoice returned.',
          output: { id: 102, owner: 'trainer' },
          flag: 'BB{object_ids_are_not_permissions}',
        }),
      };
    },
  });
  assert.equal(s.d.querySelectorAll('article').length, 21);
  await s.click('a[href="/practice/idor"]');
  assert.equal(s.w.location.pathname, '/practice/idor');
  await s.click(
    [...s.d.querySelectorAll('button')].find((button) => button.textContent === 'Reveal hint 1')
  );
  assert.match(s.d.querySelector('ol').textContent, /101/);
  await s.fill('#invoiceId', '102');
  await s.submit('form');
  assert.match(s.d.querySelector('.bb-response').textContent, /Challenge completed/);
  assert.equal(JSON.parse(s.requests[0][1].body).invoiceId, '102');
  assert.equal(s.w.localStorage.getItem('breach.practice.progress.v1'), null);
  await s.click('a[href="/practice"]');
  assert.match(s.d.querySelector('[role="status"]').textContent, /1 of 21/);
  assert.deepEqual(s.errors, []);
  await s.close();
  const restored = await open('practice.html', {
    app: true,
    url: 'http://localhost/practice',
    progress: saved,
  });
  assert.match(restored.d.querySelector('[role="status"]').textContent, /1 of 21/);
  await restored.close();
});
test('terminal help/about/clear and three-question quiz are state-driven', async () => {
  const s = await open('testcopy2.html');
  const command = async (value) => {
    await s.fill('[aria-label="Terminal command"]', value);
    await s.enter('[aria-label="Terminal command"]');
  };
  await command('help');
  assert.match(s.d.querySelector('#terminal').textContent, /Available commands/);
  await command('about');
  assert.match(s.d.querySelector('#terminal').textContent, /simulates a basic hacking interface/);
  await command('clear');
  assert.equal(s.d.querySelector('#terminal').textContent.trim(), '>');
  await command('quiz');
  await command('wrong');
  await command('wrong');
  await command('wrong');
  assert.match(s.d.querySelector('#terminal').textContent, /Your score: 0\/3/);
  assert.equal(s.d.querySelector('[aria-label="Terminal command"]').value, '');
  await s.close();
});
test('SQL demo keeps failure and injection outcomes; normal text renders as text', async () => {
  const s = await open('testcopy2.html');
  await s.fill('#username', 'student');
  await s.click([...s.d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Login'));
  assert.equal(s.d.querySelector('#output').textContent, 'Login Failed!');
  await s.fill('#username', "' OR '1'='1");
  await s.click([...s.d.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Login'));
  assert.match(s.d.querySelector('#output').textContent, /Login Successful/);
  assert.equal(s.d.querySelector('#info'), null);
  await s.close();
});
test('learning journey selects each step and links to the relevant experience', async () => {
  const s = await open('testcopy2.html');
  const journey = s.d.querySelector('.bb-journey');
  const buttons = [...journey.querySelectorAll('.bb-journey-steps button')];
  assert.equal(buttons.length, 3);
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'true');
  assert.match(journey.textContent, /Choose your first challenge/);
  await s.click(buttons[1]);
  assert.equal(buttons[0].getAttribute('aria-pressed'), 'false');
  assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
  assert.match(journey.textContent, /Stuck\? Ask Honey/);
  assert.match(journey.querySelector('.bb-flow-chat-user').textContent, /I'm stuck\. What now\?/);
  assert.match(
    journey.querySelector('.bb-flow-chat-honey').textContent,
    /Check how your input joins the query\./
  );
  assert.match(journey.textContent, /Honey is your AI helper inside the platform/);
  assert.equal(journey.querySelectorAll('.bb-flow-row.is-lit').length, 2);
  assert.equal(journey.querySelectorAll('.bb-flow-lines path').length, 4);
  assert.ok(journey.querySelector('[data-honey-antennas="two"]'));
  assert.equal(journey.querySelector('canvas'), null);
  assert.equal(journey.querySelector('.bb-honey-chat'), null);
  await s.click(buttons[2]);
  assert.match(journey.textContent, /Completed labs are saved to your account/);
  assert.equal(journey.querySelector('.bb-journey-link').getAttribute('href'), '/access');
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('Floating Honey answers hints for the current signed-in lab', async () => {
  const calls = [];
  const hints = [
    'Look at how your input appears inside the query.',
    'A single quote can end a quoted SQL value.',
  ];
  const s = await open('practice.html', {
    app: true,
    url: 'http://localhost/practice/sql-injection',
    fetch: async (url, options) => {
      if (!String(url).endsWith('/api/honey/chat')) throw new Error('Unexpected request');
      const body = JSON.parse(options.body);
      calls.push(body);
      const index = body.hintIndex;
      return {
        ok: true,
        json: async () => ({
          success: true,
          reply: hints[index],
          source: 'hints',
          nextHintIndex: Math.min(index + 1, hints.length - 1),
          hasMoreHints: index < hints.length - 1,
        }),
      };
    },
  });
  await s.click('[aria-label="Ask Honey"]');
  const journey = s.d.querySelector('.bb-assistant-panel');
  const flush = () => s.act(() => new Promise((resolve) => setTimeout(resolve, 20)));
  await s.click(journey.querySelector('.bb-honey-starters button'));
  await flush();
  assert.deepEqual(calls[0], {
    message: "I'm stuck. What now?",
    labId: 'sql-injection',
    hintIndex: 0,
  });
  assert.match(
    journey.querySelector('.bb-honey-log').textContent,
    /Look at how your input appears/
  );
  await s.fill('.bb-honey-form input', 'Still stuck');
  await s.submit('.bb-honey-form');
  await flush();
  assert.equal(calls[1].hintIndex, 1);
  assert.match(journey.querySelector('.bb-honey-log').textContent, /A single quote can end/);
  await s.act(() =>
    journey.dispatchEvent(new s.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  );
  assert.equal(s.d.querySelector('.bb-assistant-panel'), null);
  assert.equal(s.d.activeElement.getAttribute('aria-label'), 'Ask Honey');
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('SQL challenge is immediately visible and shows results without hints or explanations', async () => {
  const s = await open('testcopy2.html');
  const byText = (text) =>
    [...s.d.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
  assert.ok(s.d.querySelector('#username'));
  assert.ok(s.d.querySelector('#password'));
  assert.equal(s.d.querySelector('.bb-sql-try'), null);
  assert.equal(byText('Injection example'), undefined);
  await s.fill('#username', 'student');
  await s.click(byText('Login'));
  assert.equal(s.d.querySelector('#output').textContent, 'Login Failed!');
  await s.fill('#username', "' OR '1'='1");
  await s.click(byText('Login'));
  assert.equal(s.d.querySelector('#output').textContent, 'Login Successful!');
  assert.equal(s.d.querySelector('#info'), null);
  await s.fill('#username', '<img src=x onerror=alert(1)>');
  await s.click(byText('Login'));
  assert.equal(s.d.querySelector('#output').textContent, 'Login Failed!');
  assert.equal(s.d.querySelector('.bb-sql-demo img'), null);
  assert.deepEqual(s.requests, []);
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('learning journey plays automatically and supports pause, manual selection and reduced motion', async () => {
  const intervals = new Map();
  const s = await open('testcopy2.html', { intervals });
  const journeyTimers = () => [...intervals.values()].filter((timer) => timer.delay === 4500);
  const journey = s.d.querySelector('.bb-journey');
  const buttons = [...journey.querySelectorAll('.bb-journey-steps button')];
  assert.equal(journeyTimers().length, 1);
  const interval = journeyTimers()[0];
  assert.equal(interval.delay, 4500);
  await s.act(() => interval.callback());
  assert.equal(buttons[1].getAttribute('aria-pressed'), 'true');
  await s.click(buttons[2]);
  assert.equal(journeyTimers().length, 0);
  assert.equal(journey.querySelector('.bb-journey-play').textContent, 'Play animation');
  await s.click('.bb-journey-play');
  assert.equal(journeyTimers().length, 1);
  await s.close();
  assert.equal(intervals.size, 0);
  const reduced = await open('testcopy2.html', { intervals, reducedMotion: true });
  assert.equal(intervals.size, 0);
  assert.equal(reduced.d.querySelector('.bb-journey-play').disabled, true);
  await reduced.close();
});
test('FAQ expansion and disclaimer dismissal update React state', async () => {
  const s = await open('testcopy2.html');
  const faq = s.d.querySelector('[aria-expanded]');
  await s.click(faq);
  assert.equal(faq.getAttribute('aria-expanded'), 'true');
  assert.equal(faq.nextElementSibling.classList.contains('hidden'), false);
  await s.click(faq);
  assert.equal(faq.getAttribute('aria-expanded'), 'false');
  await s.click('#acceptDisclaimer');
  assert.equal(s.d.querySelector('#disclaimer'), null);
  await s.close();
});
test('course modal shows the selected list and closes', async () => {
  const s = await open('content/main.html');
  await s.click('.bb-course-card button');
  assert.equal(s.d.querySelector('#vulnerabilityTitle').textContent, 'SQL Injection');
  assert.equal(s.d.querySelectorAll('#vulnerabilityList li').length, 4);
  await s.click([...s.d.querySelectorAll('button')].find((b) => b.textContent === 'Close'));
  assert.equal(s.d.querySelector('[role="dialog"]'), null);
  await s.close();
});
test('access request keeps JSON contract and server error message', async () => {
  const s = await open('access/access.html', {
    fetch: async () => ({
      ok: true,
      json: async () => ({ success: false, message: 'Invalid or expired access code.' }),
    }),
  });
  await s.fill('#accessCode', 'test-code');
  await s.submit('#accessForm');
  assert.equal(s.requests.length, 1);
  assert.equal(s.requests[0][0], '/api/access-codes/validate');
  assert.deepEqual(JSON.parse(s.requests[0][1].body), { code: 'test-code' });
  assert.match(s.d.querySelector('#message').textContent, /Invalid or expired/);
  await s.close();
});
test('successful access changes the client route to courses', async () => {
  const s = await open('access/access.html', {
    app: true,
    url: 'http://localhost/access',
    fetch: async () => ({ ok: true, json: async () => ({ success: true }) }),
  });
  await s.fill('#accessCode', 'example');
  await s.submit('#accessForm');
  assert.equal(s.w.location.pathname, '/courses');
  assert.match(s.d.body.textContent, /A world of little discoveries/);
  await s.close();
});
test('Get Started requires login, shows Google first, then restores the original access-code step', async () => {
  const s = await open('access/access.html', {
    app: true,
    url: 'http://localhost/access',
    user: null,
    fetch: async (url, options) => ({
      ok: JSON.parse(options.body).password === 'a-correct-password',
      json: async () =>
        JSON.parse(options.body).password === 'a-correct-password'
          ? { success: true, user: { id: 'signed-in', email: 'learner@example.com' } }
          : { success: false, message: 'Unable to sign in. Check your email and password.' },
    }),
  });
  assert.equal(s.d.querySelector('#accessForm'), null);
  const buttons = [...s.d.querySelectorAll('.bb-auth-card button')];
  assert.match(buttons[0].textContent, /Continue with Google/);
  assert.equal(buttons[0].disabled, false);
  await s.fill('#accountEmail', 'learner@example.com');
  await s.fill('#accountPassword', 'wrong');
  await s.submit('form');
  assert.match(s.d.querySelector('[role="status"]').textContent, /Unable to sign in/);
  await s.fill('#accountPassword', 'a-correct-password');
  await s.submit('form');
  assert.ok(s.d.querySelector('#accessForm'));
  assert.match(s.d.querySelector('[aria-label="Your account"]').textContent, /learner@example.com/);
  assert.equal(s.w.localStorage.length, 0);
  assert.equal(s.w.sessionStorage.length, 0);
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('signup and reset forms provide confirmation feedback without granting access', async () => {
  const s = await open('access/access.html', {
    app: true,
    url: 'http://localhost/access',
    user: null,
    fetch: async () => ({
      ok: true,
      json: async () => ({ success: true, message: 'Check your email for a confirmation link.' }),
    }),
  });
  await s.click(
    [...s.d.querySelectorAll('button')].find((button) => button.textContent === 'Create an account')
  );
  assert.equal(s.d.querySelector('#accountPassword').minLength, 12);
  await s.fill('#accountEmail', 'learner@example.com');
  await s.fill('#accountPassword', 'a-new-password-123');
  await s.submit('form');
  assert.equal(s.requests[0][0], '/api/auth/signup');
  assert.equal(s.d.querySelector('#accessForm'), null);
  assert.match(s.d.querySelector('[role="status"]').textContent, /confirmation/);
  await s.click(
    [...s.d.querySelectorAll('button')].find((button) => button.textContent === 'Forgot password?')
  );
  assert.equal(s.d.querySelector('#accountPassword'), null);
  await s.submit('form');
  assert.equal(s.requests[1][0], '/api/auth/reset-request');
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('sign out removes protected page content and returns to login', async () => {
  const s = await open('access/access.html', {
    app: true,
    url: 'http://localhost/access',
    fetch: async () => ({ ok: true, json: async () => ({ success: true }) }),
  });
  assert.ok(s.d.querySelector('#accessForm'));
  await s.click(
    [...s.d.querySelectorAll('button')].find((button) => button.textContent === 'Sign out')
  );
  assert.equal(s.d.querySelector('#accessForm'), null);
  assert.ok(s.d.querySelector('#accountEmail'));
  assert.equal(s.requests[0][0], '/api/auth/logout');
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('admin lists, generates, and cleans up codes through the Node API', async () => {
  const s = await open('access/admin.html', {
    fetch: async (url, options) => ({
      ok: true,
      json: async () =>
        url.endsWith('/api/access-codes') && options.method === 'GET'
          ? { success: true, codes: [{ code: 'example', expires_at: 'tomorrow' }] }
          : { success: true, code: 'generated' },
    }),
  });
  assert.match(s.d.querySelector('#codesList').textContent, /example.*tomorrow/);
  await s.submit('#generateForm');
  assert.match(s.d.querySelector('.bb-code-result').textContent, /generated/);
  assert.deepEqual(
    JSON.parse(s.requests.find(([, options]) => options.method === 'POST')[1].body),
    { duration: '1-day', codeMode: 'random' }
  );
  await s.click('#cleanupBtn');
  assert.match(s.d.body.textContent, /cleaned up/);
  assert.ok(s.requests.some(([url]) => url === '/api/access-codes/cleanup'));
  await s.close();
});
test('profile edits save controlled values and return to display mode', async () => {
  const s = await open('profile2.html');
  await s.click('#editButton');
  assert.equal(s.d.querySelector('#name').value, 'John Doe');
  await s.fill('#name', 'Example Student');
  await s.fill('#bio', 'Updated bio');
  await s.submit('#profileForm');
  assert.equal(s.d.querySelector('#displayName').textContent, 'Example Student');
  assert.equal(s.d.querySelector('#displayBio').textContent, 'Updated bio');
  assert.equal(s.d.querySelector('#profileForm').classList.contains('hidden'), true);
  await s.close();
});
test('the legacy labs route offers 21 working selectable lab cards', async () => {
  const s = await open('labs.html', { app: true, url: 'http://localhost/labs' });
  assert.equal(s.d.querySelectorAll('article').length, 21);
  const links = [...s.d.querySelectorAll('article>a')];
  assert.equal(new Set(links.map((a) => a.getAttribute('href'))).size, 21);
  await s.click(links[2]);
  assert.match(s.w.location.pathname, /^\/practice\//);
  assert.ok(s.d.querySelector('form'));
  assert.ok(s.d.querySelector('button[type="submit"],form button'));
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('SQL lab preserves search and union-based training result', async () => {
  const s = await open('vulnerabilities/union-based-sql-injection.html');
  await s.fill('#examQuery', 'Biology');
  await s.submit('#examResultsForm');
  assert.match(s.d.querySelector('#examResults').textContent, /Biology/);
  await s.fill('#examQuery', 'union');
  await s.submit('#examResultsForm');
  assert.match(s.d.querySelector('#examResults').textContent, /Admin Access/);
  await s.close();
});
test('XSS lab retains raw teaching content and comments on new and original posts', async () => {
  const s = await open('XSS.html');
  await s.fill('#postTitle', 'Example post');
  await s.fill('#postContent', '<b>HTML training content</b>');
  await s.submit('#postForm');
  const posts = s.d.querySelector('#posts');
  const preview = posts.querySelector('iframe[title="Post content preview"]');
  assert.match(new URL(preview.src).searchParams.get('html'), /<b>HTML training content<\/b>/);
  assert.equal(preview.getAttribute('sandbox'), 'allow-scripts allow-modals');
  assert.equal(posts.querySelector('b'), null);
  const toggles = [...posts.querySelectorAll('button')].filter((b) =>
    b.textContent.includes('Comments')
  );
  for (const toggle of toggles) {
    await s.click(toggle);
    assert.equal(toggle.getAttribute('aria-expanded'), 'true');
  }
  await s.fill(posts.querySelector('textarea'), '<em>Comment example</em>');
  await s.click(
    [...posts.querySelectorAll('button')].find((b) => b.textContent === 'Post Comment')
  );
  assert.ok(
    [...posts.querySelectorAll('.comments iframe')].some((frame) =>
      new URL(frame.src).searchParams.get('html').includes('<em>Comment example</em>')
    )
  );
  await s.fill('#postTitle', 'Second post');
  await s.submit('#postForm');
  assert.equal(toggles[0].getAttribute('aria-expanded'), 'true'); // Stable post keys retain existing state.
  await s.close();
});
test('network and Linux terminals handle commands without document keyboard listeners', async () => {
  const s = await open('terminalfeature.html');
  await s.fill('#commandInput', 'nmap');
  await s.enter('#commandInput');
  assert.match(s.d.querySelector('#output').textContent, /Nmap scan report/);
  await s.fill('#commandInput', 'invalid');
  await s.enter('#commandInput');
  assert.match(s.d.querySelector('#output').textContent, /Invalid input/);
  await s.close();
  const linux = await open('terminal/terminal.html');
  await linux.fill('#user-input', 'help');
  await linux.enter('#user-input');
  assert.match(linux.d.querySelector('#output').textContent, /Available Commands/);
  await linux.fill('#user-input', 'clear');
  await linux.enter('#user-input');
  assert.equal(linux.d.querySelector('#output').textContent, '');
  await linux.close();
});
test('tutorial advances all three steps and cancels timers on unmount', async () => {
  const s = await open('tutorial/Union-based-sql-injection.html');
  const advance = () => s.act(() => new Promise((resolve) => s.w.setTimeout(resolve, 1050)));
  await s.fill('#username', "'");
  await advance();
  assert.equal(s.d.querySelector('#step-title').textContent, 'Step 2');
  await s.click('#submit-btn');
  await advance();
  assert.equal(s.d.querySelector('#step-title').textContent, 'Step 3');
  await s.fill('#username', "' OR 1=1--");
  await advance();
  assert.equal(s.d.querySelector('#step-title').textContent, 'Tutorial Completed!');
  await s.close();
});
test('clean routes, legacy aliases, client navigation and page lifecycle work together', async () => {
  const s = await open('testcopy2.html', { app: true });
  assert.equal(s.w.location.pathname, '/');
  const root = s.d.getElementById('root');
  await s.click([...s.d.querySelectorAll('a')].find((a) => a.textContent.trim() === 'About'));
  assert.equal(s.w.location.pathname, '/about');
  assert.equal(s.d.getElementById('root'), root);
  assert.match(s.d.title, /About/);
  await s.act(() => s.w.harness.navigate('/courses'));
  await s.click(s.d.querySelector('h2').parentElement.querySelector('button'));
  assert.equal(s.d.querySelectorAll('#vulnerabilityList li').length, 4);
  await s.act(() => s.w.harness.navigate('/'));
  await s.act(() => s.w.harness.navigate('/courses'));
  assert.equal(s.d.querySelector('[role="dialog"]'), null);
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('base paths preserve clean routes, images, and API requests', async () => {
  const s = await open('access/access.html', {
    app: true,
    url: 'http://localhost/BreachBoulevardReact/access/access.html',
    base: '/BreachBoulevardReact',
    fetch: async () => ({ ok: true, json: async () => ({ success: false }) }),
  });
  assert.equal(s.w.location.pathname, '/BreachBoulevardReact/access');
  assert.equal(
    s.d.querySelector('img').getAttribute('src'),
    '/BreachBoulevardReact/access/BBLOGO.png'
  );
  await s.fill('#accessCode', 'example');
  await s.submit('#accessForm');
  assert.equal(s.requests[0][0], '/BreachBoulevardReact/api/access-codes/validate');
  await s.close();
});
test('production build has compiled CSS and route aliases for the Node server', () => {
  const html = fs.readFileSync('dist/index.html', 'utf8');
  const asset = html.match(/src="([^"]+\.js)"/)[1];
  assert.ok(fs.existsSync(path.join('dist', asset)));
  assert.ok(fs.statSync('dist/styles/tailwind.css').size > 1000);
  for (const p of pages.filter((p) => p.path !== 'index.html'))
    assert.ok(fs.existsSync(path.join('dist', p.path)));
  assert.ok(fs.existsSync('server/index.mjs'));
  function noPhp(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) noPhp(target);
      else assert.ok(!target.endsWith('.php'), target);
    }
  }
  noPhp('dist');
});
test('page source contains no legacy adapters, document queries, or imperative rendering', () => {
  function inspect(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) inspect(file);
      else {
        assert.ok(!file.endsWith('.behavior.js'));
        assert.doesNotMatch(
          fs.readFileSync(file, 'utf8'),
          /document\.(getElementById|querySelector|addEventListener)|\.innerHTML\s*=|\.textContent\s*=|data-bb-event|initialize\(/,
          file
        );
      }
    }
  }
  inspect('src/pages');
  inspect('src/components');
  inspect('src/hooks');
});

test('upload lab retains its multipart request contract with the Node API', async () => {
  const s = await open('testupload.html');
  const form = s.d.querySelector('form');
  assert.equal(form.getAttribute('action'), '/api/labs/file-upload');
  assert.equal(form.method, 'post');
  assert.equal(form.enctype, 'multipart/form-data');
  assert.equal(form.querySelector('input[type="file"]').name, 'uploaded_file');
  assert.equal(form.querySelector('input[type="file"]').required, true);
  await s.close();
});

test('admin route shows a sign-in gate and restores the dashboard after login', async () => {
  const s = await open('access/admin.html', {
    app: true,
    url: 'http://localhost/admin',
    fetch: async (url) => ({
      ok: true,
      json: async () =>
        url.endsWith('/session') ? { authenticated: false, configured: true } : { success: true },
    }),
  });
  assert.equal(s.d.querySelector('#generateForm'), null);
  await s.fill('#admin-password', 'test-password');
  await s.submit('form');
  assert.ok(s.d.querySelector('#generateForm'));
  assert.equal(s.d.querySelector('#admin-password'), null);
  await s.close();
});

test('Google sign-in remains available when the options request fails and recovers after a start error', async () => {
  const s = await open('access/access.html', {
    app: true,
    url: 'http://localhost/access',
    user: null,
    optionsFailure: true,
    fetch: async () => ({
      ok: false,
      json: async () => ({ success: false, message: 'Please try Google sign-in again.' }),
    }),
  });
  const google = [...s.d.querySelectorAll('button')].find(
    (button) => button.textContent.trim() === 'Continue with Google'
  );
  assert.equal(google.disabled, false);
  await s.click(google);
  assert.equal(s.requests[0][0], '/api/auth/google');
  assert.match(s.d.querySelector('[role="status"]').textContent, /try Google sign-in again/);
  assert.equal(google.disabled, false);
  assert.deepEqual(s.errors, []);
  await s.close();
});

test('lab search, difficulty and completion filters compose and can be cleared', async () => {
  const s = await open('practice.html', {
    app: true,
    url: 'http://localhost/practice',
    progress: ['idor'],
  });
  await s.fill('[aria-label="Search labs"]', 'invoice');
  assert.equal(s.d.querySelectorAll('article').length, 1);
  assert.match(s.d.querySelector('article').textContent, /Read the other invoice/);
  await s.click(
    [...s.d.querySelectorAll('.bb-tabs button')].find((button) =>
      button.textContent.startsWith('Not started')
    )
  );
  assert.equal(s.d.querySelectorAll('article').length, 0);
  await s.click(
    [...s.d.querySelectorAll('button')].find((button) => button.textContent === 'Clear filters')
  );
  assert.equal(s.d.querySelectorAll('article').length, 21);
  await s.act(() => {
    const select = s.d.querySelector('[aria-label="Lab difficulty"]');
    select.value = 'Intermediate';
    select.dispatchEvent(new s.w.Event('change', { bubbles: true }));
  });
  assert.equal(s.d.querySelectorAll('article').length, 1);
  assert.match(s.d.querySelector('article').textContent, /Escape the public folder/);
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('dashboard uses account progress and continues to the next incomplete lab', async () => {
  const s = await open('dashboard.html', {
    app: true,
    url: 'http://localhost/dashboard',
    progress: ['sql-injection', 'xss'],
  });
  assert.match(s.d.querySelector('[aria-label="10% completed"]').textContent, /10/);
  assert.equal(s.d.querySelectorAll('.bb-topic-row').length, 4);
  assert.equal(s.d.querySelectorAll('.bb-mascot').length, 2);
  assert.equal(s.d.querySelector('.bb-path-view-all').getAttribute('href'), '/practice');
  const next = [...s.d.querySelectorAll('a')].find((a) => a.textContent === 'Continue learning');
  assert.equal(next.getAttribute('href'), '/practice/authentication');
  await s.click(next);
  assert.equal(s.w.location.pathname, '/practice/authentication');
  assert.ok(s.d.querySelector('form'));
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('every course popup entry opens a supported lab or tutorial route', async () => {
  const s = await open('content/main.html', { app: true, url: 'http://localhost/courses' });
  for (const button of [...s.d.querySelectorAll('.bb-course-card button')]) {
    await s.act(() => button.focus());
    await s.click(button);
    for (const link of s.d.querySelectorAll('#vulnerabilityList a'))
      assert.ok(s.w.harness.resolvePage(link.pathname), link.pathname);
    await s.act(() =>
      s.d
        .querySelector('[role="dialog"]')
        .dispatchEvent(new s.w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    );
    assert.equal(s.d.querySelector('[role="dialog"]'), null);
    assert.equal(s.d.activeElement, button);
  }
  assert.deepEqual(s.errors, []);
  await s.close();
});

test('dashboard teaser shows the learner rank and links to the boulevard', async () => {
  const s = await open('dashboard.html', {
    app: true,
    url: 'http://localhost/dashboard',
    progress: ['sql-injection', 'xss', 'idor'],
  });
  const flush = () => s.act(() => new Promise((resolve) => setTimeout(resolve, 20)));
  await flush();
  const teaser = s.d.querySelector('.bb-boulevard-teaser');
  assert.ok(teaser);
  assert.match(teaser.textContent, /Block Captain/);
  assert.match(teaser.textContent, /2 more labs until Boulevard Legend/);
  const walk = [...teaser.querySelectorAll('a')].find(
    (a) => a.textContent === 'Walk the boulevard'
  );
  assert.equal(walk.getAttribute('href'), '/community');
  assert.deepEqual(s.errors, []);
  await s.close();
});

test('community page renders rank, streets and posts as plain text', async () => {
  const payload = '<img src=x onerror=alert(1)>';
  const streets = [
    { id: 'main-street', name: 'Main Street', tagline: 'Start here', icon: 'heart', posts: 0 },
    {
      id: 'payload-alley',
      name: 'Payload Alley',
      tagline: 'Where payloads wait',
      icon: 'heart',
      posts: 1,
    },
  ];
  const json = (data) => ({ ok: true, json: async () => ({ success: true, ...data }) });
  const post = {
    id: '33333333-3333-4333-8333-333333333333',
    title: payload,
    body: 'Body text',
    street: 'payload-alley',
    author: { name: 'Ana Rivera', block: 'Block Captain' },
    votes: 0,
    voted: false,
    comments: 0,
    createdAt: new Date().toISOString(),
  };
  const s = await open('community.html', {
    app: true,
    url: 'http://localhost/community',
    fetch: async (url) => {
      if (url === '/api/community/overview')
        return json({
          streets,
          you: {
            name: 'Ana Rivera',
            rank: {
              title: 'Block Captain',
              note: 'Other learners ask you for directions.',
              completed: 3,
              progress: 0,
              nextTitle: 'Boulevard Legend',
              labsToNext: 2,
            },
          },
        });
      if (url.startsWith('/api/community/posts?street=payload-alley'))
        return json({ posts: [post] });
      return json({ posts: [] });
    },
  });
  const flush = () => s.act(() => new Promise((resolve) => setTimeout(resolve, 20)));
  await flush();
  assert.match(s.d.querySelector('.bb-rank-card').textContent, /Block Captain/);
  const alley = [...s.d.querySelectorAll('.bb-street-card')].find((b) =>
    b.textContent.includes('Payload Alley')
  );
  assert.ok(alley);
  await s.click(alley);
  await flush();
  const title = s.d.querySelector('.bb-post h3');
  assert.equal(title.textContent, payload);
  assert.equal(s.d.querySelector('img[src="x"]'), null);
  assert.match(s.d.querySelector('.bb-post').textContent, /Ana Rivera/);
  assert.deepEqual(s.errors, []);
  await s.close();
});

test('admin sends custom expiration and code settings and displays duplicate-code errors', async () => {
  let duplicate = false;
  const s = await open('access/admin.html', {
    fetch: async (url, options) =>
      options.method === 'GET'
        ? { ok: true, json: async () => ({ success: true, codes: [] }) }
        : {
            ok: !duplicate,
            json: async () =>
              duplicate
                ? {
                    success: false,
                    message: 'That access code already exists. Choose a different code.',
                  }
                : { success: true, code: 'CLASS-2028', expiresAt: '2028-05-01T09:00:00.000Z' },
          },
  });
  await s.act(() => {
    const select = s.d.querySelector('#codeDuration');
    select.value = 'custom';
    select.dispatchEvent(new s.w.Event('change', { bubbles: true }));
  });
  await s.fill('#codeExpiry', '2028-05-01T17:00');
  await s.click('input[name="codeMode"][value="custom"]');
  await s.fill('#customAccessCode', 'CLASS-2028');
  await s.submit('#generateForm');
  const payload = JSON.parse(s.requests.find(([, options]) => options.method === 'POST')[1].body);
  assert.equal(payload.duration, 'custom');
  assert.equal(payload.code, 'CLASS-2028');
  assert.equal(payload.codeMode, 'custom');
  assert.equal(payload.expiresAt, new s.w.Date('2028-05-01T17:00').toISOString());
  assert.match(s.d.querySelector('.bb-code-result').textContent, /CLASS-2028/);
  duplicate = true;
  await s.submit('#generateForm');
  assert.match(s.d.querySelector('[role="alert"]').textContent, /already exists/);
  assert.equal(s.d.querySelector('#generateForm button').disabled, false);
  assert.deepEqual(s.errors, []);
  await s.close();
});

test('admin automatically loads codes and updates the list after extension and deletion', async () => {
  let expiry = '2030-01-01T00:00:00.000Z';
  let deleted = false;
  const s = await open('access/admin.html', {
    fetch: async (url, options) => ({
      ok: true,
      json: async () => {
        if (options.method === 'GET')
          return { success: true, codes: deleted ? [] : [{ code: 'MANAGE', expires_at: expiry }] };
        if (url.endsWith('/extend')) {
          expiry = '2030-01-08T00:00:00.000Z';
          return {
            success: true,
            accessCode: { code: 'MANAGE', expires_at: expiry },
            message: 'Access code extended.',
          };
        }
        deleted = true;
        return { success: true, message: 'Access code deleted.' };
      },
    }),
  });
  assert.match(s.d.querySelector('#codesList').textContent, /MANAGE/);
  await s.click('[aria-label="Extend MANAGE"]');
  await s.submit('[aria-label="Extend access code"]');
  assert.deepEqual(JSON.parse(s.requests.find(([url]) => url.endsWith('/extend'))[1].body), {
    code: 'MANAGE',
    duration: '7-days',
  });
  assert.equal(s.d.querySelector('#codesList time').dateTime, expiry);
  await s.click('[aria-label="Delete MANAGE"]');
  await s.click([...s.d.querySelectorAll('button')].find((b) => b.textContent === 'Cancel'));
  assert.match(s.d.querySelector('#codesList').textContent, /MANAGE/);
  await s.click('[aria-label="Delete MANAGE"]');
  await s.submit('[aria-label="Delete access code"]');
  assert.match(s.d.querySelector('#codesList').textContent, /No codes found/);
  assert.ok(s.requests.some(([, options]) => options.method === 'DELETE'));
  assert.deepEqual(s.errors, []);
  await s.close();
});

test('Honey is available on signed-in public pages and hidden from logged-out visitors', async () => {
  const visitor = await open('testcopy2.html', { app: true, url: 'http://localhost/', user: null });
  assert.equal(visitor.d.querySelector('.bb-assistant'), null);
  assert.equal(visitor.d.querySelector('canvas'), null);
  await visitor.close();
  const member = await open('testcopy2.html', { app: true, url: 'http://localhost/' });
  assert.ok(member.d.querySelector('[aria-label="Ask Honey"]'));
  await member.click('[aria-label="Ask Honey"]');
  assert.equal(member.d.querySelectorAll('.bb-assistant-panel').length, 1);
  assert.match(member.d.querySelector('.bb-honey-empty').textContent, /find your way/);
  assert.ok(member.d.querySelector('[data-honey-antennas="two"]'));
  assert.deepEqual(member.errors, []);
  await member.close();
});

test('CTF collection filters to five labs per difficulty and opens a distinct target website', async () => {
  const s = await open('practice.html', { app: true, url: 'http://localhost/practice?track=ctf' });
  try {
    assert.equal(s.d.querySelectorAll('article').length, 15);
    for (const level of ['Easy', 'Medium', 'Hard']) {
      await s.click(
        [...s.d.querySelectorAll('.ctf-levels button')].find((b) =>
          b.textContent.includes(level + ' CTFs')
        )
      );
      assert.equal(s.d.querySelectorAll('article').length, 5);
    }
    await s.click('a[href="/practice/ctf-devops-build"]');
    assert.match(s.d.querySelector('.target-browser').textContent, /PipelineNine/);
    assert.equal(s.d.querySelectorAll('.lab-phase-bar button').length, 2);
    assert.ok(s.d.querySelector('#ctfFlag'));
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
});

test('CTF native controls send requests and only flag submission records completion', async () => {
  let requestCount = 0;
  const s = await open('practice.html', {
    app: true,
    url: 'http://localhost/practice/ctf-social-draft',
    fetch: async () => ({
      ok: true,
      json: async () =>
        ++requestCount === 1
          ? {
              success: true,
              completed: false,
              output: { recoveredFlag: 'BB{training_only}' },
              feedback: 'Flag recovered',
            }
          : {
              success: true,
              completed: true,
              flag: 'BB{training_only}',
              output: { accepted: true },
              feedback: 'Flag accepted',
            },
    }),
  });
  try {
    await s.fill('#site-postId', '42');
    assert.equal(s.d.querySelector('#postId').value, '42');
    await s.submit('form');
    assert.equal(JSON.parse(s.requests[0][1].body).action, 'interact');
    assert.equal(s.d.querySelector('.bb-completion'), null);
    await s.fill('#ctfFlag', 'BB{training_only}');
    await s.submit('.lab-flag-form');
    assert.equal(JSON.parse(s.requests[1][1].body).action, 'submit-flag');
    assert.match(s.d.querySelector('.bb-completion').textContent, /Flag captured/);
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
});

test('lab walkthrough types, changes phases, pauses, and respects reduced motion', async () => {
  const intervals = new Map(),
    s = await open('testcopy2.html', { intervals });
  try {
    const tick = [...intervals.values()].find((t) => t.delay === 80);
    assert.ok(tick);
    await s.act(() => {
      for (let i = 0; i < 65; i++) tick.callback();
    });
    assert.match(s.d.querySelector('.walkthrough-input').textContent, /OR/);
    await s.click(
      [...s.d.querySelectorAll('.walkthrough-controls button')].find(
        (b) => b.textContent === 'Pause demo'
      )
    );
    assert.equal(
      [...intervals.values()].some((t) => t.delay === 80),
      false
    );
    await s.click([...s.d.querySelectorAll('.walkthrough-steps button')][3]);
    assert.match(s.d.querySelector('.walkthrough-stage').textContent, /BB\{demo_query_bypass\}/);
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
  const reduced = await open('testcopy2.html', { reducedMotion: true, intervals });
  try {
    assert.equal(intervals.size, 0);
    assert.match(reduced.d.querySelector('.walkthrough-controls').textContent, /Motion reduced/);
  } finally {
    await reduced.close();
  }
});

test('streak garden shows saved days, interactive flowers, milestones and a Honey high-five', async () => {
  const streak = practiceStreak(
    {
      user_metadata: {
        bb_practice_days: ['2026-10-31', '2026-11-01', '2026-11-02'],
        bb_streak_timezone: 'Asia/Singapore',
      },
    },
    { now: Date.parse('2026-11-02T12:00Z') }
  );
  const s = await open('dashboard.html', { app: true, url: 'http://localhost/dashboard', streak });
  try {
    assert.equal(s.d.querySelector('.streak-count>span').textContent, '3');
    assert.equal(s.d.querySelectorAll('.streak-day').length, 7);
    assert.equal(s.d.querySelectorAll('.streak-day.is-active').length, 1);
    assert.match(s.d.querySelector('.streak-today-tag').textContent, /blooming/);
    await s.click(s.d.querySelectorAll('.streak-day')[1]);
    assert.match(s.d.querySelector('.streak-day-detail').textContent, /future discovery/);
    await s.click(s.d.querySelectorAll('.streak-badge-list button')[0]);
    assert.match(s.d.querySelector('.streak-badges>p').textContent, /Earned/);
    await s.click(s.d.querySelectorAll('.streak-badge-list button')[1]);
    assert.match(s.d.querySelector('.streak-badges>p').textContent, /7 consecutive/);
    await s.click('.streak-celebrate');
    assert.ok(s.d.querySelector('.streak-confetti'));
    assert.equal(s.requests.length, 0, 'A high-five must never change persisted activity');
    assert.match(s.d.querySelector('.streak-rules').textContent, /Asia\/Singapore/);
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
});
test('a missed streak preserves the personal best and a failed progress request never invents activity', async () => {
  const streak = practiceStreak(
    { user_metadata: { bb_practice_days: ['2026-10-28', '2026-10-29', '2026-10-30'] } },
    { now: Date.parse('2026-11-02T12:00Z') }
  );
  const s = await open('dashboard.html', { app: true, url: 'http://localhost/dashboard', streak });
  try {
    assert.equal(s.d.querySelector('.streak-count>span').textContent, '0');
    assert.match(s.d.querySelector('.streak-records').textContent, /3 personal best/);
    assert.match(s.d.querySelector('.streak-heading p').textContent, /comeback/);
  } finally {
    await s.close();
  }
  const empty = await open('dashboard.html', { app: true, url: 'http://localhost/dashboard' });
  try {
    assert.equal(empty.d.querySelector('.streak-count'), null);
    assert.match(empty.d.querySelector('.streak-garden').textContent, /couldn’t be loaded/);
  } finally {
    await empty.close();
  }
});

test('appearance switch persists across routes and Honey is introduced on the landing page', async () => {
  const s = await open('testcopy2.html', { app: true, url: 'http://localhost/' });
  try {
    assert.match(s.d.querySelector('#meet-honey-title').textContent, /Your AI companion/);
    assert.match(
      s.d.querySelector('.bb-honey-intro-note small').textContent,
      /prepared conversations/
    );
    await s.click('[aria-label="Switch to light mode"]');
    assert.equal(s.d.documentElement.dataset.theme, 'light');
    assert.equal(s.w.localStorage.getItem('bb.theme'), 'light');
    await s.act(() => s.w.harness.navigate('/dashboard'));
    assert.equal(s.d.documentElement.dataset.theme, 'light');
    assert.equal(s.d.querySelectorAll('.bb-theme-toggle').length, 1);
    await s.click('[aria-label="Switch to dark mode"]');
    assert.equal(s.w.localStorage.getItem('bb.theme'), 'dark');
    assert.equal(s.d.querySelectorAll('.bb-mascot').length, 2);
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
});

test('theme control still works when browser storage is unavailable', async () => {
  const s = await open('testcopy2.html');
  try {
    s.w.Storage.prototype.setItem = () => {
      throw Error('Storage blocked');
    };
    await s.click('[aria-label="Switch to light mode"]');
    assert.equal(s.d.documentElement.dataset.theme, 'light');
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
});

test('unknown routes show Honey’s public 404 and return safely to the homepage', async () => {
  for (const path of ['/lost-little-bee', '/practice/not-a-real-lab', '/%ZZ']) {
    const s = await open('testcopy2.html', {
      app: true,
      url: 'http://localhost' + path,
      user: null,
    });
    try {
      assert.match(s.d.querySelector('h1').textContent, /scenic route/);
      assert.match(s.d.title, /404/);
      assert.equal(s.d.querySelector('meta[name="robots"]').content, 'noindex, nofollow');
      assert.ok(s.d.querySelector('.bb-not-found .bb-mascot'));
      assert.equal(s.d.querySelector('.bb-auth-card'), null);
      await s.click('.bb-lost-actions a');
      assert.equal(s.w.location.pathname, '/');
      assert.match(s.d.title, /Breach Boulevard/);
      assert.doesNotMatch(s.d.title, /404/);
      assert.equal(s.d.querySelector('meta[name="robots"]'), null);
      assert.deepEqual(s.errors, []);
    } finally {
      await s.close();
    }
  }
});
test('legacy DOM XSS input is confined to an opaque sandbox rather than evaluated by the app', async () => {
  const s = await open('dom.html');
  try {
    await s.fill('#nameInput', '<img src=x onerror="parent.document.body.innerHTML=123">');
    await s.click('button');
    const frame = s.d.querySelector('iframe');
    assert.ok(frame);
    assert.equal(frame.getAttribute('sandbox'), 'allow-scripts allow-modals');
    assert.match(new URL(frame.src).searchParams.get('html'), /onerror/);
    assert.ok(s.d.querySelector('#nameInput'));
    assert.deepEqual(s.errors, []);
  } finally {
    await s.close();
  }
});
