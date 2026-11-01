import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { createAppServer } from '../server/index.mjs';
import { SupabaseAccessCodes } from '../server/supabase.mjs';

const listen = (server) =>
  new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
const close = (server) => new Promise((resolve) => server.close(resolve));

test('Supabase Node.js integration preserves access-code workflows without exposing credentials', async (t) => {
  const calls = [];
  const rows = [];
  const key = 'sb_secret_local_test_key';
  let upstreamError = null;
  let collision = false;
  const database = http.createServer(async (req, res) => {
    let text = '';
    for await (const chunk of req) text += chunk;
    const url = new URL(req.url, 'http://localhost');
    const body = text ? JSON.parse(text) : null;
    calls.push({
      method: req.method,
      path: url.pathname,
      query: url.searchParams,
      body,
      headers: req.headers,
    });
    res.setHeader('Content-Type', 'application/json');
    if (upstreamError) {
      res.statusCode = upstreamError;
      res.end(JSON.stringify({ message: `private upstream detail ${key}` }));
      return;
    }
    if (url.pathname === '/rest/v1/breach_access_codes' && req.method === 'POST') {
      if (collision) {
        collision = false;
        res.statusCode = 409;
        res.end('{"code":"23505"}');
        return;
      }
      const row = {
        code: body.code,
        expires_at: body.expires_at || new Date(Date.now() + 86400000).toISOString(),
        created_at: new Date().toISOString(),
      };
      rows.unshift(row);
      res.statusCode = 201;
      res.end(JSON.stringify([{ code: row.code }]));
      return;
    }
    if (url.pathname === '/rest/v1/breach_access_codes') {
      const filter = url.searchParams.get('code');
      const selected = filter
        ? rows.filter((row) => row.code === filter.slice(3))
        : rows;
      if (req.method === 'PATCH') {
        const matching = selected.filter(
          (row) => row.expires_at === url.searchParams.get('expires_at')?.slice(3)
        );
        matching.forEach((row) => {
          row.expires_at = body.expires_at;
        });
        res.end(JSON.stringify(matching));
        return;
      }
      if (req.method === 'DELETE') {
        for (const row of selected) rows.splice(rows.indexOf(row), 1);
        res.end(JSON.stringify(selected));
        return;
      }
      res.end(
        JSON.stringify(
          url.searchParams.get('limit') === '0'
            ? []
            : selected.map(({ code, expires_at }) => ({ code, expires_at }))
        )
      );
      return;
    }
    if (url.pathname === '/rest/v1/rpc/bb_validate_access_code') {
      res.end(
        JSON.stringify(
          rows.some(
            (row) =>
              row.code === body.p_code &&
              (!body.p_check_expiration || Date.parse(row.expires_at) > Date.now())
          )
        )
      );
      return;
    }
    if (url.pathname === '/rest/v1/rpc/bb_cleanup_expired_codes') {
      assert.deepEqual(body, {});
      let count = 0;
      for (let index = rows.length - 1; index >= 0; index--)
        if (Date.parse(rows[index].expires_at) <= Date.now()) {
          rows.splice(index, 1);
          count++;
        }
      res.end(JSON.stringify(count));
      return;
    }
    res.statusCode = 404;
    res.end('{}');
  });
  const dbPort = await listen(database);
  const env = {
    ...process.env,
    SUPABASE_URL: `http://127.0.0.1:${dbPort}`,
    SUPABASE_SECRET_KEY: key,
    SUPABASE_SERVICE_ROLE_KEY: '',
    SUPABASE_CONFIG_FILE: path.resolve('qa/nonexistent-test-config'),
  };
  const server = createAppServer({
    adminAuth: false,
    userAuth: false,
    database: new SupabaseAccessCodes({ url: env.SUPABASE_URL, key }),
  });
  const apiPort = await listen(server);
  const origin = `http://127.0.0.1:${apiPort}/api/`;
  async function request(endpoint, { method = 'GET', body } = {}) {
    const response = await fetch(origin + endpoint, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    return {
      status: response.status,
      data: await response.json(),
      cache: response.headers.get('cache-control'),
    };
  }
  try {
    calls.length = 0;
    let generated;
    await t.test(
      'generates eight-character codes, lists them, and uses secret-key headers',
      async () => {
        const result = await request('access-codes', { method: 'POST' });
        assert.equal(result.status, 200);
        assert.equal(result.data.success, true);
        assert.match(result.data.code, /^[a-f0-9]{8}$/);
        generated = result.data.code;
        const list = await request('access-codes');
        assert.equal(list.data.codes[0].code, generated);
        assert.equal(list.cache, 'no-store');
        assert.equal(calls[0].headers.apikey, key);
        assert.equal(calls[0].headers.authorization, undefined);
        assert.equal(calls[0].headers.prefer, 'return=representation');
        assert.equal(calls[1].query.get('order'), 'created_at.desc,id.desc');
      }
    );
    await t.test(
      'validates active codes, rejects expired/unknown values, and keeps legacy validation behavior',
      async () => {
        rows.push({ code: 'expired', expires_at: '2000-01-01T00:00:00Z' });
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: { code: generated } }))
            .data.message,
          'Access granted.'
        );
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: { code: 'expired' } }))
            .data.success,
          false
        );
        assert.equal(
          (await request('access-codes/check', { method: 'POST', body: { code: 'expired' } })).data
            .success,
          true
        );
        const injection = "' OR '1'='1";
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: { code: injection } }))
            .data.success,
          false
        );
        assert.equal(calls.at(-1).body.p_code, injection);
        assert.equal(calls.at(-1).path, '/rest/v1/rpc/bb_validate_access_code');
      }
    );
    await t.test('removes expired codes while keeping active records', async () => {
      const result = await request('access-codes/cleanup', { method: 'POST' });
      assert.equal(result.data.success, true);
      assert.ok(rows.every((row) => row.code !== 'expired'));
      assert.ok(rows.some((row) => row.code === generated));
    });
    await t.test(
      'empty/invalid input and unsupported methods never call the database',
      async () => {
        const before = calls.length;
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: { code: '' } })).data
            .message,
          'Access code is required.'
        );
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: '{broken' })).status,
          400
        );
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: { code: ['bad'] } })).data
            .success,
          false
        );
        assert.equal((await request('access-codes', { method: 'PATCH' })).status, 405);
        assert.equal(calls.length, before);
      }
    );
    await t.test(
      'upstream errors are reported without leaking database details or keys',
      async () => {
        upstreamError = 403;
        const response = await request('access-codes');
        assert.equal(response.status, 503);
        assert.equal(response.data.success, false);
        assert.doesNotMatch(JSON.stringify(response.data), new RegExp(key));
        assert.doesNotMatch(JSON.stringify(response.data), /private upstream detail/);
        upstreamError = null;
      }
    );
    await t.test('unique-code collisions retry instead of reporting a false success', async () => {
      collision = true;
      const before = calls.length;
      const response = await request('access-codes', { method: 'POST' });
      assert.equal(response.data.success, true);
      assert.equal(calls.length - before, 2);
    });
    await t.test(
      'custom codes and selected expiration are persisted and duplicate codes return a useful conflict',
      async () => {
        const expiresAt = new Date(Date.now() + 100 * 86400000).toISOString();
        const created = await request('access-codes', {
          method: 'POST',
          body: { codeMode: 'custom', code: 'CYBER-CLASS', duration: 'custom', expiresAt },
        });
        assert.equal(created.status, 200);
        assert.equal(created.data.code, 'CYBER-CLASS');
        assert.equal(rows.find((row) => row.code === 'CYBER-CLASS').expires_at, expiresAt);
        collision = true;
        const before = calls.length;
        const duplicate = await request('access-codes', {
          method: 'POST',
          body: { codeMode: 'custom', code: 'CYBER-CLASS', duration: '7-days' },
        });
        assert.equal(duplicate.status, 409);
        assert.match(duplicate.data.message, /already exists/);
        assert.equal(calls.length - before, 1);
        const list = await request('access-codes');
        assert.equal(
          list.data.codes.find((row) => row.code === 'CYBER-CLASS').expires_at,
          expiresAt
        );
      }
    );
    await t.test('invalid generation settings never reach the database', async () => {
      const before = calls.length;
      for (const body of [
        { duration: 'forever' },
        { codeMode: 'custom', code: 'bad code' },
        { duration: 'custom', expiresAt: '2000-01-01T00:00:00.000Z' },
      ]) {
        const result = await request('access-codes', { method: 'POST', body });
        assert.equal(result.status, 400);
      }
      assert.equal(calls.length, before);
      const started = Date.now();
      const result = await request('access-codes', {
        method: 'POST',
        body: { duration: '7-days' },
      });
      assert.ok(Math.abs(Date.parse(result.data.expiresAt) - (started + 7 * 86400000)) < 5000);
      assert.equal(
        rows.find((row) => row.code === result.data.code).expires_at,
        result.data.expiresAt
      );
    });
    await t.test(
      'extensions preserve remaining time and deletion revokes only the selected code',
      async () => {
        const code = 'MANAGE-ME',
          current = new Date(Date.now() + 2 * 86400000).toISOString();
        rows.push({ code, expires_at: current });
        let result = await request('access-codes/extend', {
          method: 'POST',
          body: { code, duration: '7-days' },
        });
        assert.equal(result.status, 200);
        assert.equal(
          Date.parse(result.data.accessCode.expires_at),
          Date.parse(current) + 7 * 86400000
        );
        const same = rows.find((row) => row.code === code).expires_at;
        result = await request('access-codes/extend', {
          method: 'POST',
          body: { code, duration: 'custom', expiresAt: current },
        });
        assert.equal(result.status, 400);
        assert.equal(rows.find((row) => row.code === code).expires_at, same);
        const custom = new Date(Date.parse(same) + 86400000).toISOString();
        result = await request('access-codes/extend', {
          method: 'POST',
          body: { code, duration: 'custom', expiresAt: custom },
        });
        assert.equal(result.data.accessCode.expires_at, custom);
        const before = rows.length;
        assert.equal(
          (await request('access-codes', { method: 'DELETE', body: { code } })).status,
          200
        );
        assert.equal(rows.length, before - 1);
        assert.ok(!rows.some((row) => row.code === code));
        assert.equal(
          (await request('access-codes/validate', { method: 'POST', body: { code } })).data.success,
          false
        );
        assert.equal(
          (await request('access-codes', { method: 'DELETE', body: { code } })).status,
          404
        );
        assert.equal(
          (
            await request('access-codes/extend', {
              method: 'POST',
              body: { code, duration: '7-days' },
            })
          ).status,
          404
        );
        rows.push({ code, expires_at: '2000-01-01T00:00:00.000Z' });
        result = await request('access-codes/extend', {
          method: 'POST',
          body: { code, duration: '1-day' },
        });
        assert.equal(result.status, 200);
        assert.ok(
          Math.abs(Date.parse(result.data.accessCode.expires_at) - Date.now() - 86400000) < 5000
        );
      }
    );
    await t.test(
      'connection check performs a read-only check and does not print credentials',
      async () => {
        // Spawn asynchronously so the mock Data API can respond while the check runs.
        const check = spawn(process.execPath, ['scripts/check-database.mjs'], {
          env,
          windowsHide: true,
        });
        let output = '';
        check.stdout.on('data', (chunk) => (output += chunk));
        check.stderr.on('data', (chunk) => (output += chunk));
        const code = await new Promise((resolve, reject) => {
          check.once('error', reject);
          check.once('exit', resolve);
        });
        assert.equal(code, 0);
        assert.match(output, /verified/);
        assert.ok(!output.includes(key));
        assert.equal(calls.at(-1).query.get('limit'), '0');
      }
    );
    await t.test('missing configuration fails clearly instead of silently using MySQL', () => {
      const check = spawnSync(process.execPath, ['scripts/check-database.mjs'], {
        env: { ...env, SUPABASE_URL: '', SUPABASE_SECRET_KEY: '' },
        encoding: 'utf8',
        windowsHide: true,
      });
      assert.equal(check.status, 1);
      assert.match(check.stderr, /Supabase is not configured/);
    });
  } finally {
    server.closeAllConnections();
    await close(server);
    database.closeAllConnections();
    await close(database);
  }
});

test('Supabase migration restricts application data to the server and keeps database-time expiry', () => {
  const sql = fs.readFileSync('supabase/migrations/202610310001_access_codes.sql', 'utf8');
  assert.match(sql, /enable row level security/i);
  assert.match(sql, /revoke all on table .* from public, anon, authenticated/i);
  assert.match(sql, /expires_at > now\(\)/i);
  assert.match(sql, /expires_at <= now\(\)/i);
  assert.match(sql, /default \(now\(\) \+ interval '1 day'\)/i);
  assert.doesNotMatch(sql, /security definer|using\s*\(true\)/i);
});
