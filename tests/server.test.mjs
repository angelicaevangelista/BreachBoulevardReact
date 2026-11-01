import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createAppServer } from '../server/index.mjs';
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
