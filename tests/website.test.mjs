import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';
import { JSDOM, VirtualConsole } from 'jsdom';

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
    optionsFailure = false,
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
      return { ok: true, json: async () => ({ success: true, completed: progress }) };
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
  assert.equal(s.d.querySelectorAll('article').length, 6);
  await s.click('a[href="/practice/idor"]');
  assert.equal(s.w.location.pathname, '/practice/idor');
  await s.click(
    [...s.d.querySelectorAll('button')].find((button) => button.textContent === 'Reveal hint 1')
  );
  assert.match(s.d.querySelector('ol').textContent, /101/);
  await s.fill('#invoiceId', '102');
  await s.submit('form');
  assert.match(s.d.querySelector('[aria-live="polite"]').textContent, /Challenge completed/);
  assert.equal(JSON.parse(s.requests[0][1].body).invoiceId, '102');
  assert.equal(s.w.localStorage.getItem('breach.practice.progress.v1'), null);
  await s.click('a[href="/practice"]');
  assert.match(s.d.querySelector('[role="status"]').textContent, /1 of 6/);
  assert.deepEqual(s.errors, []);
  await s.close();
  const restored = await open('practice.html', {
    app: true,
    url: 'http://localhost/practice',
    progress: saved,
  });
  assert.match(restored.d.querySelector('[role="status"]').textContent, /1 of 6/);
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
  assert.match(s.d.querySelector('#info').textContent, /SELECT \* FROM users/);
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
  assert.match(journey.textContent, /Experiment, with hints nearby/);
  assert.ok(journey.querySelector('.bb-journey-block-2.is-active'));
  await s.click(buttons[2]);
  assert.match(journey.textContent, /Completed labs are saved to your account/);
  assert.equal(journey.querySelector('.bb-journey-link').getAttribute('href'), '/access');
  assert.deepEqual(s.errors, []);
  await s.close();
});
test('guided SQL demo shows submitted examples, limitations, and parameterized query', async () => {
  const s = await open('testcopy2.html');
  const byText = (text) =>
    [...s.d.querySelectorAll('button')].find((b) => b.textContent.trim() === text);
  await s.click(byText('Ordinary input'));
  assert.equal(s.d.querySelector('#username').value, 'student');
  await s.click(byText('Login'));
  assert.equal(s.d.querySelector('#output').textContent, 'Login Failed!');
  assert.match(s.d.querySelector('#info').textContent, /does not check credentials or run SQL/);
  assert.match(s.d.querySelector('#info').textContent, /username = \? AND password = \?/);
  await s.click(byText('Injection example'));
  assert.equal(s.d.querySelector('#username').value, "' OR '1'='1");
  await s.click(byText('Login'));
  assert.match(s.d.querySelector('#output').textContent, /Simulated SQL Injection/);
  assert.match(s.d.querySelector('#info').textContent, /quote alone does not necessarily/);
  assert.match(s.d.querySelector('#info').textContent, /' OR '1'='1/);
  await s.fill('#username', '<img src=x onerror=alert(1)>');
  await s.click(byText('Login'));
  assert.match(s.d.querySelector('#info').textContent, /<img src=x onerror=alert\(1\)>/);
  assert.equal(s.d.querySelector('#info img'), null);
  assert.deepEqual(s.requests, []);
  assert.deepEqual(s.errors, []);
  await s.close();
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
  await s.click('button');
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
  const buttons = [...s.d.querySelectorAll('button')];
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
  await s.click('#viewCodesBtn');
  assert.match(s.d.querySelector('#codesList').textContent, /example.*tomorrow/);
  await s.submit('#generateForm');
  assert.match(s.alerts[0], /generated/);
  await s.click('#cleanupBtn');
  assert.match(s.alerts[1], /cleaned up/);
  assert.deepEqual(
    s.requests.map((r) => r[0]),
    ['/api/access-codes', '/api/access-codes', '/api/access-codes/cleanup']
  );
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
test('the legacy labs route offers six working selectable lab cards', async () => {
  const s = await open('labs.html', { app: true, url: 'http://localhost/labs' });
  assert.equal(s.d.querySelectorAll('article').length, 6);
  const links = [...s.d.querySelectorAll('article>a')];
  assert.equal(new Set(links.map((a) => a.getAttribute('href'))).size, 6);
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
  assert.match(preview.srcdoc, /<b>HTML training content<\/b>/);
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
      frame.srcdoc.includes('<em>Comment example</em>')
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
  assert.equal(s.d.querySelectorAll('article').length, 6);
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
  assert.match(s.d.querySelector('[aria-label="33% completed"]').textContent, /33/);
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
