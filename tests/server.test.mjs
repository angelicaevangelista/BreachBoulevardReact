import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createAppServer } from '../server/index.mjs';
import { createHoneyService } from '../server/honey.mjs';
import { simulateFileExecution } from '../server/uploads.mjs';

async function fixture(options = {}) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'breach-node-test-'));
  const staticDirectory = path.join(directory, 'public');
  await fs.mkdir(staticDirectory);
  await fs.writeFile(
    path.join(staticDirectory, 'index.html'),
    '<html><body>React application</body></html>'
  );
  await fs.writeFile(path.join(staticDirectory, 'asset.js'), 'console.log("asset")');
  await fs.writeFile(path.join(staticDirectory, '.env.server'), 'PRIVATE_TEST_VALUE');
  const server = createAppServer({
    adminAuth: false,
    userAuth: false,
    staticDirectory,
    uploadDirectory: path.join(directory, 'uploads'),
    database: { async checkConnection() {} },
    ...options,
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return {
    directory,
    origin,
    server,
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
      await fs.rm(directory, { recursive: true, force: true });
    },
  };
}
function upload(name, content, field = 'file', type = 'text/plain') {
  const form = new FormData();
  form.append(field, new Blob([content], { type }), name);
  return form;
}

test('Node serves React routes, assets, and health without exposing private files', async () => {
  const f = await fixture();
  try {
    for (const route of ['/', '/about', '/courses', '/access', '/terminal/linux']) {
      const response = await fetch(f.origin + route);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /React application/);
    }
    assert.equal(
      (await fetch(f.origin + '/asset.js')).headers.get('content-type'),
      'text/javascript; charset=utf-8'
    );
    assert.equal((await fetch(f.origin + '/.env.server')).status, 404);
    assert.equal((await fetch(f.origin + '/server/config.mjs')).status, 404);
    assert.equal((await fetch(f.origin + '/missing.php')).status, 404);
    const health = await (await fetch(f.origin + '/api/health')).json();
    assert.deepEqual(health, { success: true, runtime: 'node', database: 'supabase' });
  } finally {
    await f.close();
  }
});

test('Node handles persistent uploads and returns inert downloadable content', async () => {
  const f = await fixture();
  try {
    const response = await fetch(f.origin + '/api/uploads', {
      method: 'POST',
      body: upload('example.txt', 'uploaded example'),
    });
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /File uploaded successfully/);
    const link = html.match(/href="([^"]+)"/)[1];
    const file = await fetch(f.origin + link);
    assert.equal(await file.text(), 'uploaded example');
    assert.match(file.headers.get('content-disposition'), /^attachment/);
    assert.equal(file.headers.get('x-content-type-options'), 'nosniff');
    const missing = await fetch(
      f.origin + '/api/uploads/00000000-0000-0000-0000-000000000000/example.txt'
    );
    assert.equal(missing.status, 404);
  } finally {
    await f.close();
  }
});

test('avatar uploads preserve image response contract and reject unsupported types', async () => {
  const f = await fixture();
  try {
    const response = await fetch(f.origin + '/api/uploads/avatar', {
      method: 'POST',
      body: upload('avatar.png', new Uint8Array([137, 80, 78, 71]), 'avatar', 'image/png'),
    });
    const data = await response.json();
    assert.equal(data.status, 'success');
    assert.equal(data.message, 'Avatar updated successfully.');
    const image = await fetch(f.origin + data.filePath);
    assert.equal(image.headers.get('content-type'), 'image/png');
    assert.match(image.headers.get('content-disposition'), /^inline/);
    const unsupported = await (
      await fetch(f.origin + '/api/uploads/avatar', {
        method: 'POST',
        body: upload('avatar.exe', 'example', 'avatar'),
      })
    ).json();
    assert.equal(unsupported.status, 'error');
  } finally {
    await f.close();
  }
});

test('uploaded script lab simulates literal output without executing uploaded source', async () => {
  const f = await fixture();
  try {
    const marker = path.join(f.directory, 'must-not-exist');
    const source = `<?php echo "<h1>Lab output</h1>"; file_put_contents(${JSON.stringify(marker)},"executed"); ?>`;
    const response = await fetch(f.origin + '/api/labs/file-upload', {
      method: 'POST',
      body: upload('example.php', source, 'uploaded_file'),
    });
    const html = await response.text();
    assert.match(html, /Simulated file execution/);
    assert.match(html, /<h1>Lab output<\/h1>/);
    await assert.rejects(fs.access(marker));
    const link = html.match(/href="([^"]+)"/)[1];
    const downloaded = await fetch(f.origin + link);
    assert.equal(await downloaded.text(), source);
    assert.match(downloaded.headers.get('content-disposition'), /^attachment/);
    assert.match(
      simulateFileExecution(Buffer.from('<?php system("anything"); ?>')),
      /No literal output/
    );
  } finally {
    await f.close();
  }
});

test('Node preserves reflected-XSS and CSRF teaching responses', async () => {
  const f = await fixture();
  try {
    const response = await fetch(f.origin + '/api/labs/reflected-xss', {
      method: 'POST',
      body: new URLSearchParams({ name: '<b>Student</b>' }),
    });
    assert.match(await response.text(), /<h1>Hello, <b>Student<\/b>!<\/h1>/);
    const csrf = await fetch(f.origin + '/api/labs/csrf', {
      method: 'POST',
      body: new URLSearchParams({ action: 'transfer_funds', amount: '100' }),
    });
    assert.equal(csrf.status, 200);
    assert.equal(await csrf.text(), '');
    const runtime = await (await fetch(f.origin + '/api/labs/runtime-info')).text();
    assert.match(runtime, /Node.js/);
    assert.doesNotMatch(runtime, /SECRET_KEY|PRIVATE_TEST_VALUE/);
  } finally {
    await f.close();
  }
});

test('Node rejects invalid multipart data and oversized uploads cleanly', async () => {
  const f = await fixture({ maxUploadBytes: 16 });
  try {
    const oversized = await fetch(f.origin + '/api/uploads', {
      method: 'POST',
      body: upload('large.txt', 'a'.repeat(100)),
    });
    assert.equal(oversized.status, 413);
    const broken = await fetch(f.origin + '/api/uploads', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data; boundary=bad' },
      body: 'not a multipart payload',
    });
    assert.equal(broken.status, 400);
    const empty = await fetch(f.origin + '/api/uploads', { method: 'POST', body: new FormData() });
    assert.match(await empty.text(), /No file uploaded/);
  } finally {
    await f.close();
  }
});

test('Node routing supports deployment under a base path', async () => {
  const f = await fixture({ basePath: '/training' });
  try {
    assert.equal((await fetch(f.origin + '/training/about')).status, 200);
    assert.equal((await fetch(f.origin + '/training/api/health')).status, 200);
    assert.equal((await fetch(f.origin + '/api/health')).status, 404);
  } finally {
    await f.close();
  }
});

function honeyRequest(origin, body, method = 'POST') {
  return fetch(origin + '/api/honey/chat', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  });
}

test('Honey returns progressive lab hints from local rules', async () => {
  const { practiceLabs } = await import('../src/data/practice-labs.js');
  const lab = practiceLabs.find((item) => item.id === 'sql-injection');
  const f = await fixture({ honey: createHoneyService() });
  try {
    const first = await honeyRequest(f.origin, { message: 'I am stuck', labId: lab.id });
    const firstBody = await first.json();
    assert.equal(first.status, 200);
    assert.equal(firstBody.reply, lab.hints[0]);
    assert.equal(firstBody.hasMoreHints, true);

    const second = await honeyRequest(f.origin, {
      message: 'Next hint',
      labId: lab.id,
      hintIndex: firstBody.nextHintIndex,
    });
    const secondBody = await second.json();
    assert.equal(secondBody.reply, lab.hints[1]);

    const last = await honeyRequest(f.origin, {
      message: 'Next hint',
      labId: lab.id,
      hintIndex: lab.hints.length - 1,
    });
    const lastBody = await last.json();
    assert.equal(lastBody.reply, lab.hints.at(-1));
    assert.equal(lastBody.hasMoreHints, false);
  } finally {
    await f.close();
  }
});

test('Honey validates messages, lab ids, and hint indexes', async () => {
  const f = await fixture({ honey: createHoneyService() });
  try {
    assert.equal((await honeyRequest(f.origin, { message: '   ' })).status, 400);
    assert.equal((await honeyRequest(f.origin, { message: 'x'.repeat(501) })).status, 400);
    assert.equal((await honeyRequest(f.origin, { message: 'hi', labId: 'nope' })).status, 400);
    assert.equal(
      (await honeyRequest(f.origin, { message: 'hi', labId: 'xss', hintIndex: -1 })).status,
      400
    );
    assert.equal((await honeyRequest(f.origin, { message: 'hi' }, 'GET')).status, 405);
  } finally {
    await f.close();
  }
});

test('Honey answers platform questions and refuses everything else', async () => {
  const f = await fixture({ honey: createHoneyService() });
  const refusal =
    'I can only help with Breach Boulevard. Ask me about the labs, a lab objective, or the next hint.';
  try {
    const reply = async (message, labId) =>
      (await (await honeyRequest(f.origin, { message, labId })).json()).reply;
    assert.match(await reply('hello'), /I'm Honey/);
    assert.match(await reply('who are you?'), /AI helper bee inside Breach Boulevard/);
    assert.match(await reply('which labs are there'), /Breach Boulevard has 6 labs: Break the login query/);
    assert.equal(
      await reply('what is my objective', 'sql-injection'),
      'Objective: Make the login condition true without knowing the password.'
    );
    assert.match(await reply('what is the platform?'), /hands-on practice platform/);
    assert.equal(await reply('what is the weather in Paris'), refusal);
    assert.equal(await reply('write me a poem about cats', 'sql-injection'), refusal);
    assert.match(
      await reply('what is the password', 'authentication'),
      /^I won't hand over the answer, but here's a nudge: /
    );
  } finally {
    await f.close();
  }
});

test('Honey runs from local rules with no external model dependency', async () => {
  const source = await fs.readFile(new URL('../server/honey.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /fetch\(|provider|https?:\/\/|api[_-]?key/i);
});

test('Honey rate limits repeated requests from one client', async () => {
  const f = await fixture({ honey: createHoneyService({ rateLimit: 2 }) });
  try {
    assert.equal((await honeyRequest(f.origin, { message: 'one' })).status, 200);
    assert.equal((await honeyRequest(f.origin, { message: 'two' })).status, 200);
    assert.equal((await honeyRequest(f.origin, { message: 'three' })).status, 429);
  } finally {
    await f.close();
  }
});

test('admin code management requires an authenticated session when enabled', async () => {
  const { AdminAuth } = await import('../server/admin-auth.mjs');
  const f = await fixture({
    adminAuth: new AdminAuth({ password: 'test-admin-password', required: true }),
    database: {
      async all() {
        return [];
      },
      async validate() {
        return true;
      },
    },
  });
  try {
    assert.equal((await fetch(f.origin + '/api/access-codes')).status, 401);
    const bad = await fetch(f.origin + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'incorrect' }),
    });
    assert.equal(bad.status, 401);
    const good = await fetch(f.origin + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'test-admin-password' }),
    });
    assert.equal(good.status, 200);
    const cookie = good.headers.get('set-cookie');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /SameSite=Strict/);
    const sessionCookie = cookie.split(';')[0];
    assert.equal(
      (await fetch(f.origin + '/api/access-codes', { headers: { Cookie: sessionCookie } })).status,
      200
    );
    assert.equal(
      (await fetch(f.origin + '/api/access-codes', { headers: { Cookie: sessionCookie + 'x' } }))
        .status,
      401
    );
    const validation = await fetch(f.origin + '/api/access-codes/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'example' }),
    });
    assert.equal((await validation.json()).success, true);
  } finally {
    await f.close();
  }
});

test('production admin API fails closed when the admin password is missing', async () => {
  const { AdminAuth } = await import('../server/admin-auth.mjs');
  const f = await fixture({ adminAuth: new AdminAuth({ required: true }) });
  try {
    assert.equal((await fetch(f.origin + '/api/access-codes')).status, 401);
    const response = await fetch(f.origin + '/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"password":"anything"}',
    });
    assert.equal(response.status, 503);
  } finally {
    await f.close();
  }
});

function communityLearner(id, name, completed = []) {
  return {
    origin: '',
    user: { id, user_metadata: { full_name: name, bb_completed_labs: completed } },
    handle: async () => false,
    requireUser: async function () {
      return this.user;
    },
    saveCompletion: async () => [],
  };
}

async function communityFixture() {
  const learners = {
    ana: communityLearner('11111111-1111-4111-8111-111111111111', 'Ana Rivera', [
      'sql-injection',
      'xss',
      'idor',
    ]),
    ben: communityLearner('22222222-2222-4222-8222-222222222222', 'Ben'),
  };
  const communityDirectory = path.join(os.tmpdir(), 'breach-community-' + globalThis.crypto.randomUUID());
  const f = await fixture({
    userAuth: (req) => learners[req.headers['x-test-learner']] || null,
    communityDirectory,
  });
  for (const learner of Object.values(learners)) learner.origin = f.origin;
  const close = f.close;
  f.close = async () => {
    await close();
    await fs.rm(communityDirectory, { recursive: true, force: true });
  };
  return f;
}

function communityCall(f, who, method, route, body) {
  const headers = { Origin: f.origin };
  if (who) headers['X-Test-Learner'] = who;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(f.origin + '/api/community' + route, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('community requires a signed-in learner', async () => {
  const f = await communityFixture();
  try {
    assert.equal((await communityCall(f, null, 'GET', '/overview')).status, 401);
    assert.equal((await communityCall(f, null, 'GET', '/posts')).status, 401);
    assert.equal((await communityCall(f, null, 'POST', '/posts', {})).status, 401);
  } finally {
    await f.close();
  }
});

test('community overview lists the six streets and ranks learners by completed labs', async () => {
  const f = await communityFixture();
  try {
    const ana = await (await communityCall(f, 'ana', 'GET', '/overview')).json();
    assert.equal(ana.streets.length, 6);
    assert.equal(ana.you.name, 'Ana Rivera');
    assert.equal(ana.you.rank.title, 'Block Captain');
    assert.equal(ana.you.rank.labsToNext, 2);
    assert.equal(ana.you.rank.nextTitle, 'Boulevard Legend');
    assert.ok(!JSON.stringify(ana).includes('11111111-1111'));

    const ben = await (await communityCall(f, 'ben', 'GET', '/overview')).json();
    assert.equal(ben.you.name, 'Ben');
    assert.equal(ben.you.rank.title, 'Pedestrian');
  } finally {
    await f.close();
  }
});

test('community posts keep user text as plain text and hide learner identity', async () => {
  const f = await communityFixture();
  try {
    const payload = '<img src=x onerror=alert(1)>';
    const created = await communityCall(f, 'ana', 'POST', '/posts', {
      street: 'payload-alley',
      title: payload,
      body: 'Line one\n<script>alert(1)</script>',
    });
    assert.equal(created.status, 200);
    const { post } = await created.json();
    assert.equal(post.title, payload);
    assert.equal(post.author.name, 'Ana Rivera');
    assert.equal(post.author.block, 'Block Captain');
    assert.equal(post.votes, 0);

    const text = await (await communityCall(f, 'ben', 'GET', '/posts?street=payload-alley')).text();
    const { posts } = JSON.parse(text);
    assert.equal(posts.length, 1);
    assert.equal(posts[0].title, payload);
    assert.equal(posts[0].body, 'Line one\n<script>alert(1)</script>');
    assert.ok(!text.includes('11111111-1111'));
    assert.ok(!text.includes('authorId'));

    const other = await (await communityCall(f, 'ben', 'GET', '/posts?street=main-street')).json();
    assert.equal(other.posts.length, 0);
  } finally {
    await f.close();
  }
});

test('community validates streets, titles, bodies and sort order', async () => {
  const f = await communityFixture();
  try {
    const post = (fields) =>
      communityCall(f, 'ana', 'POST', '/posts', {
        street: 'main-street',
        title: 'A fair title',
        body: 'A fair body',
        ...fields,
      });
    assert.equal((await post({ street: 'nope' })).status, 400);
    assert.equal((await post({ title: 'ab' })).status, 400);
    assert.equal((await post({ body: '     ' })).status, 400);
    assert.equal((await post({ body: 'x'.repeat(2001) })).status, 400);
    assert.equal((await communityCall(f, 'ana', 'GET', '/posts?street=nope')).status, 400);
    assert.equal((await communityCall(f, 'ana', 'PUT', '/posts', {})).status, 405);
    assert.equal((await communityCall(f, 'ana', 'POST', '/overview', {})).status, 405);
  } finally {
    await f.close();
  }
});

test('community votes toggle per learner and top sorting favours loved posts', async () => {
  const f = await communityFixture();
  try {
    const first = (
      await (
        await communityCall(f, 'ana', 'POST', '/posts', {
          street: 'recon-row',
          title: 'First post',
          body: 'Found the open port',
        })
      ).json()
    ).post;
    const second = (
      await (
        await communityCall(f, 'ana', 'POST', '/posts', {
          street: 'recon-row',
          title: 'Second post',
          body: 'Read the headers',
        })
      ).json()
    ).post;

    const voteOnce = await (
      await communityCall(f, 'ben', 'POST', `/posts/${first.id}/vote`, {})
    ).json();
    assert.deepEqual([voteOnce.votes, voteOnce.voted], [1, true]);

    const seenByAna = (await (await communityCall(f, 'ana', 'GET', '/posts?street=recon-row')).json())
      .posts;
    assert.equal(seenByAna.find((post) => post.id === first.id).voted, false);

    const unvote = await (await communityCall(f, 'ben', 'POST', `/posts/${first.id}/vote`, {})).json();
    assert.deepEqual([unvote.votes, unvote.voted], [0, false]);

    await communityCall(f, 'ana', 'POST', `/posts/${second.id}/vote`, {});
    await communityCall(f, 'ben', 'POST', `/posts/${second.id}/vote`, {});
    const newest = (await (await communityCall(f, 'ana', 'GET', '/posts?street=recon-row&sort=new')).json())
      .posts;
    assert.equal(newest[0].id, second.id);
    const top = (await (await communityCall(f, 'ana', 'GET', '/posts?street=recon-row&sort=top')).json())
      .posts;
    assert.equal(top[0].id, second.id);
    assert.equal(top[0].votes, 2);

    const missing = '00000000-0000-4000-8000-000000000000';
    assert.equal((await communityCall(f, 'ana', 'POST', `/posts/${missing}/vote`, {})).status, 404);
    assert.equal((await communityCall(f, 'ana', 'POST', '/posts/not-a-post/vote', {})).status, 404);
    assert.equal((await communityCall(f, 'ana', 'GET', `/posts/${first.id}/vote`)).status, 405);
  } finally {
    await f.close();
  }
});

test('community replies are stored as plain text and counted on the post', async () => {
  const f = await communityFixture();
  try {
    const { post } = await (
      await communityCall(f, 'ana', 'POST', '/posts', {
        street: 'honeypot-heights',
        title: 'Stuck on the login lab',
        body: 'What should I check first?',
      })
    ).json();
    const reply = await communityCall(f, 'ben', 'POST', `/posts/${post.id}/comments`, {
      body: '<b>Check the cookies</b>',
    });
    assert.equal(reply.status, 200);
    const { comment } = await reply.json();
    assert.equal(comment.body, '<b>Check the cookies</b>');
    assert.equal(comment.author.name, 'Ben');

    const listed = (await (await communityCall(f, 'ana', 'GET', `/posts/${post.id}/comments`)).json())
      .comments;
    assert.equal(listed.length, 1);
    assert.equal(listed[0].body, '<b>Check the cookies</b>');

    const counted = (
      await (await communityCall(f, 'ana', 'GET', '/posts?street=honeypot-heights')).json()
    ).posts[0];
    assert.equal(counted.comments, 1);

    assert.equal((await communityCall(f, 'ben', 'POST', `/posts/${post.id}/comments`, { body: '  ' })).status, 400);
    assert.equal(
      (await communityCall(f, 'ben', 'POST', `/posts/${post.id}/comments`, { body: 'x'.repeat(601) })).status,
      400
    );
    const missing = '00000000-0000-4000-8000-000000000000';
    assert.equal((await communityCall(f, 'ben', 'POST', `/posts/${missing}/comments`, { body: 'hi' })).status, 404);
    assert.equal((await communityCall(f, 'ben', 'GET', `/posts/${missing}/comments`)).status, 404);
  } finally {
    await f.close();
  }
});
