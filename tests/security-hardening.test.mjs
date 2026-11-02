import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RequestLimiter, clientFingerprint, requestPolicy } from '../server/request-limits.mjs';
import { createAppServer } from '../server/index.mjs';
import { applicationCsp } from '../server/security-headers.mjs';
import { resolveRoute } from '../src/data/routes.js';
test('request counters enforce a window and retry time, and recover after expiry', async () => {
  let now = 1000;
  const limiter = new RequestLimiter({ persistent: false, now: () => now }),
    policy = { name: 'test', limit: 2, seconds: 60 };
  assert.equal((await limiter.consume('client', policy)).allowed, true);
  assert.equal((await limiter.consume('client', policy)).allowed, true);
  const blocked = await limiter.consume('client', policy);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retry_after_seconds, 60);
  assert.equal((await limiter.consume('other', policy)).allowed, true);
  now += 60000;
  assert.equal((await limiter.consume('client', policy)).allowed, true);
});
test('local clients cannot evade limits by forging forwarded IPs, and identifiers are hashed', () => {
  const req = {
    socket: { remoteAddress: '127.0.0.1' },
    headers: { 'x-forwarded-for': '203.0.113.2' },
  };
  const first = clientFingerprint(req, { trustedProxy: false, secret: 'test' });
  req.headers['x-forwarded-for'] = '203.0.113.3';
  assert.equal(clientFingerprint(req, { trustedProxy: false, secret: 'test' }), first);
  assert.match(first, /^[a-f\d]{64}$/);
  assert.notEqual(clientFingerprint(req, { trustedProxy: true, secret: 'test' }), first);
  assert.equal(requestPolicy('/api/admin/login', 'POST').limit, 5);
  assert.equal(requestPolicy('/api/auth/reset-request', 'POST').limit, 5);
});
test('known routes remain available, malformed and nonexistent challenge paths do not resolve', () => {
  assert.equal(resolveRoute('/practice/ctf-support-ticket'), 'practice.html');
  assert.equal(resolveRoute('/practice/nonexistent'), null);
  assert.equal(resolveRoute('/%ZZ'), null);
  assert.equal(resolveRoute('/another/site', '/site'), null);
});
test('application policy excludes inline/eval scripts; security headers and real 404 status are applied', async () => {
  const server = createAppServer({ userAuth: false, adminAuth: false });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    assert.match(applicationCsp, /script-src 'self'/);
    assert.doesNotMatch(applicationCsp, /script-src[^;]*(unsafe-inline|unsafe-eval)/);
    for (const path of ['/some-missing-page', '/practice/fake-lab']) {
      const r = await fetch(base + path);
      assert.equal(r.status, 404);
      assert.match(r.headers.get('content-security-policy'), /frame-ancestors 'none'/);
      assert.match(await r.text(), /id="root"/);
    }
    assert.equal((await fetch(base + '/dashboard')).status, 200);
    assert.equal((await fetch(base + '/.env.server')).status, 404);
    assert.equal((await fetch(base + '/%ZZ')).status, 400);
    const r = await fetch(
      base + '/api/labs/preview?html=' + encodeURIComponent('<script>alert(1)</script>')
    );
    assert.equal(r.status, 200);
    assert.match(r.headers.get('content-security-policy'), /sandbox allow-scripts/);
    assert.doesNotMatch(r.headers.get('content-security-policy'), /allow-same-origin|unsafe-eval/);
    assert.match(r.headers.get('content-security-policy'), /connect-src 'none'/);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
test('admin login is throttled and returns Retry-After before checking more passwords', async () => {
  const server = createAppServer({ userAuth: false, adminAuth: false });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    for (let i = 0; i < 5; i++)
      assert.notEqual(
        (await fetch(base + '/api/admin/login', { method: 'POST', body: '{"password":"wrong"}' }))
          .status,
        429
      );
    const r = await fetch(base + '/api/admin/login', {
      method: 'POST',
      body: '{"password":"wrong"}',
    });
    assert.equal(r.status, 429);
    assert.ok(Number(r.headers.get('retry-after')) > 0);
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});

test('oversized chunked JSON is rejected before the sender finishes its request', async () => {
  const { request } = await import('node:http');
  const server = createAppServer({ userAuth: false, adminAuth: false });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  let req;
  try {
    const response = await new Promise((resolve, reject) => {
      req = request(
        {
          hostname: '127.0.0.1',
          port: server.address().port,
          path: '/api/honey/chat',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked' },
        },
        (res) => {
          res.resume();
          resolve(res);
        }
      );
      req.once('error', reject);
      req.setTimeout(2000, () => reject(Error('Server waited for an oversized request to finish')));
      req.write(Buffer.alloc(70000, 97));
    });
    assert.equal(response.statusCode, 413);
  } finally {
    req?.destroy();
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
