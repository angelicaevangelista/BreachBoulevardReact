import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LearnerAuth, applicationOrigin } from '../server/learner-auth.mjs';
import { createAppServer } from '../server/index.mjs';

const confirmed = {
  id: 'student-one',
  email: 'student@example.com',
  email_confirmed_at: '2026-01-01',
  user_metadata: { bb_completed_labs: ['idor'] },
};
async function fixture({ user = confirmed, verified = true } = {}) {
  const calls = [];
  const client = {
    auth: {
      async getUser() {
        calls.push('getUser');
        return { data: { user: verified ? user : null }, error: verified ? null : { status: 401 } };
      },
      async signInWithPassword(input) {
        calls.push(['login', input]);
        return input.password === 'correct-password-123'
          ? { data: { user }, error: null }
          : { data: { user: null }, error: { status: 400 } };
      },
      async signUp(input) {
        calls.push(['signup', input]);
        return { data: { user, session: null }, error: null };
      },
      async resetPasswordForEmail(email, options) {
        calls.push(['reset', email, options]);
        return { error: null };
      },
      async updateUser(input) {
        calls.push(['update', input]);
        return { data: { user }, error: null };
      },
      async exchangeCodeForSession(code) {
        calls.push(['exchange', code]);
        return { error: code === 'valid-code' ? null : { status: 400 } };
      },
      async signInWithOAuth(options) {
        calls.push(['oauth', options]);
        return {
          data: { url: 'https://project.supabase.co/auth/v1/authorize?provider=google' },
          error: null,
        };
      },
      async signOut() {
        calls.push('logout');
        return { error: null };
      },
    },
  };
  const server = createAppServer({
    adminAuth: false,
    userAuth: (req, res) =>
      new LearnerAuth(req, res, {
        config: { url: 'https://project.supabase.co', key: 'test-server-key' },
        clientFactory: () => client,
        transport: async () =>
          new Response(
            JSON.stringify({ external: { email: true, google: true }, disable_signup: false })
          ),
      }),
    database: { validate: async () => true },
    uploadStore: {
      read: async () => ({
        ownerId: 'different-student',
        filename: 'private.txt',
        contents: Buffer.from('private'),
      }),
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const request = (route, { method = 'GET', body, headers = {} } = {}) =>
    fetch(origin + route, {
      method,
      headers: {
        ...(body === undefined ? {} : { Origin: origin, 'Content-Type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'manual',
    });
  return {
    origin,
    request,
    calls,
    close: async () => {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    },
  };
}
test('learner APIs reject missing, forged and unconfirmed sessions', async () => {
  for (const variant of [
    { verified: false },
    { user: { ...confirmed, email_confirmed_at: null } },
  ]) {
    const f = await fixture(variant);
    try {
      for (const path of ['/api/practice/idor', '/api/access-codes/validate'])
        assert.equal(
          (
            await f.request(path, {
              method: 'POST',
              body: { invoiceId: '102', code: 'example' },
              headers: { Cookie: 'bb_learner=forged' },
            })
          ).status,
          401
        );
      assert.equal((await f.request('/api/account/progress')).status, 401);
    } finally {
      await f.close();
    }
  }
});
test('password sign-in requires same-origin JSON and never exposes tokens', async () => {
  const f = await fixture();
  try {
    assert.equal(
      (
        await f.request('/api/auth/login', {
          method: 'POST',
          body: {},
          headers: { Origin: 'https://attacker.example' },
        })
      ).status,
      403
    );
    assert.equal(
      (
        await f.request('/api/auth/login', {
          method: 'POST',
          body: {},
          headers: { Origin: 'null' },
        })
      ).status,
      403
    );
    assert.equal(
      (
        await f.request('/api/auth/login', {
          method: 'POST',
          body: {},
          headers: { 'Content-Type': 'text/plain' },
        })
      ).status,
      415
    );
    assert.equal(
      (
        await f.request('/api/auth/login', {
          method: 'POST',
          body: { email: 'student@example.com', password: 'wrong' },
        })
      ).status,
      401
    );
    const good = await f.request('/api/auth/login', {
      method: 'POST',
      body: { email: 'student@example.com', password: 'correct-password-123' },
    });
    assert.equal(good.status, 200);
    const data = await good.json();
    assert.deepEqual(Object.keys(data.user).sort(), ['email', 'id', 'name']);
    assert.equal(data.access_token, undefined);
  } finally {
    await f.close();
  }
});
test('signup validates password, recovery avoids account enumeration, and callback ignores external redirects', async () => {
  const f = await fixture();
  try {
    assert.equal(
      (
        await f.request('/api/auth/signup', {
          method: 'POST',
          body: { email: 'student@example.com', password: 'short' },
        })
      ).status,
      400
    );
    const signup = await f.request('/api/auth/signup', {
      method: 'POST',
      body: { email: 'student@example.com', password: 'long-unique-password' },
    });
    assert.equal(signup.status, 200);
    assert.match((await signup.json()).message, /confirmation/);
    const reset = await f.request('/api/auth/reset-request', {
      method: 'POST',
      body: { email: 'student@example.com' },
    });
    assert.match((await reset.json()).message, /If this email/);
    const callback = await f.request(
      '/api/auth/callback?code=valid-code&next=https://attacker.example'
    );
    assert.equal(callback.status, 303);
    assert.equal(callback.headers.get('location'), '/access');
    const invalid = await f.request('/api/auth/callback?code=invalid-code');
    assert.equal(invalid.headers.get('location'), '/access?auth_error=callback');
    const google = await f.request('/api/auth/google', { method: 'POST', body: {} });
    assert.match((await google.json()).url, /^https:\/\/project.supabase.co\//);
    const options = f.calls.find((call) => Array.isArray(call) && call[0] === 'oauth')[1];
    assert.equal(options.options.skipBrowserRedirect, true);
    assert.match(options.options.redirectTo, /\/api\/auth\/callback$/);
  } finally {
    await f.close();
  }
});
test('verified progress is scoped to the current account and uploaded files enforce ownership', async () => {
  const f = await fixture();
  try {
    const headers = { Cookie: 'bb_learner=session' };
    const result = await f.request('/api/practice/path-traversal', {
      method: 'POST',
      body: { filename: '../secrets/mission.txt' },
      headers,
    });
    assert.equal(result.status, 200);
    assert.deepEqual((await result.json()).completedLabs, ['idor', 'path-traversal']);
    assert.ok(
      f.calls.some(
        (call) =>
          Array.isArray(call) &&
          call[0] === 'update' &&
          call[1].data.bb_completed_labs.includes('path-traversal')
      )
    );
    const progress = await f.request('/api/account/progress', { headers });
    assert.deepEqual((await progress.json()).completed, ['idor']);
    assert.equal(
      (
        await f.request('/api/uploads/12345678-1234-1234-1234-123456789abc/private.txt', {
          headers,
        })
      ).status,
      404
    );
  } finally {
    await f.close();
  }
});
test('official Supabase cookie adapter enforces HttpOnly, Secure, host-only cookies and PKCE', async () => {
  const cookieHeaders = new Map();
  let captured;
  const auth = new LearnerAuth(
    { headers: { host: 'irrelevant.example', cookie: '' } },
    {
      getHeader: (key) => cookieHeaders.get(key),
      setHeader: (key, value) => cookieHeaders.set(key, value),
    },
    {
      config: {
        url: 'https://project.supabase.co',
        key: 'server-only',
        siteUrl: 'https://breachboulevard.vercel.app',
      },
      clientFactory: (url, key, options) => {
        captured = options;
        return { auth: {} };
      },
    }
  );
  auth.client();
  assert.equal(captured.cookieOptions.name, '__Host-bb_learner');
  assert.equal(captured.cookieOptions.httpOnly, true);
  assert.equal(captured.cookieOptions.secure, true);
  captured.cookies.setAll([
    {
      name: '__Host-bb_learner',
      value: 'test-value',
      options: { domain: 'bad.example', httpOnly: false, secure: false },
    },
  ]);
  const cookie = cookieHeaders.get('Set-Cookie')[0];
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
  assert.doesNotMatch(cookie, /Domain=/);
  assert.throws(
    () => applicationOrigin({ headers: { host: 'attacker.example' } }, {}),
    /Invalid application host/
  );
});
test('official SDK creates a PKCE challenge and keeps its verifier in a secure server cookie', async () => {
  const headers = new Map();
  const auth = new LearnerAuth(
    { headers: { cookie: '' } },
    { getHeader: (key) => headers.get(key), setHeader: (key, value) => headers.set(key, value) },
    {
      config: {
        url: 'https://project.supabase.co',
        key: 'server-only',
        siteUrl: 'https://breachboulevard.vercel.app',
      },
    }
  );
  const { data, error } = await auth.client().auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://breachboulevard.vercel.app/api/auth/callback',
      skipBrowserRedirect: true,
    },
  });
  assert.equal(error, null);
  const destination = new URL(data.url);
  assert.equal(destination.searchParams.get('code_challenge_method'), 's256');
  assert.ok(destination.searchParams.get('code_challenge'));
  const cookie = headers.get('Set-Cookie').find((value) => value.includes('code-verifier'));
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=Lax/);
});

test('CTF API saves progress only after valid flag submission for the verified account', async () => {
  const f = await fixture();
  try {
    const headers = { Cookie: 'bb_learner=session', 'X-Learner-Timezone': 'Asia/Singapore' };
    const recovered = await f.request('/api/practice/ctf-social-draft', {
      method: 'POST',
      body: { postId: '42' },
      headers,
    });
    const data = await recovered.json();
    assert.equal(data.completed, false);
    assert.equal(
      f.calls.some((c) => Array.isArray(c) && c[0] === 'update'),
      false
    );
    const rejected = await f.request('/api/practice/ctf-social-draft', {
      method: 'POST',
      body: { action: 'submit-flag', flag: 'BB{forged}', completed: true },
      headers,
    });
    assert.equal((await rejected.json()).completed, false);
    const accepted = await f.request('/api/practice/ctf-social-draft', {
      method: 'POST',
      body: { action: 'submit-flag', flag: data.output.recoveredFlag },
      headers,
    });
    const capture = await accepted.json();
    assert.deepEqual(capture.completedLabs, ['idor', 'ctf-social-draft']);
    assert.equal(capture.streak.current, 1);
    assert.equal(capture.streak.activeToday, true);
    assert.equal(capture.streak.timeZone, 'Asia/Singapore');
    const activityWrite = f.calls.find((c) => Array.isArray(c) && c[0] === 'update');
    assert.deepEqual(activityWrite[1].data.bb_practice_days, [capture.streak.today]);
    assert.ok(
      f.calls.some(
        (c) =>
          Array.isArray(c) &&
          c[0] === 'update' &&
          c[1].data.bb_completed_labs.includes('ctf-social-draft')
      )
    );
  } finally {
    await f.close();
  }
});
