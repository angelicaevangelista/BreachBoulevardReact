import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluatePracticeLab } from '../server/practice-labs.mjs';
import { createAppServer } from '../server/index.mjs';
const solutions = {
  'sql-injection': { username: "' OR '1'='1" },
  xss: { payload: '<img src=x onerror=alert(1)>' },
  authentication: { username: 'trainee', password: 'welcome123' },
  idor: { invoiceId: '102' },
  'path-traversal': { filename: '../secrets/mission.txt' },
  'data-exposure': { endpoint: '/profile?debug=true' },
};
for (const [id, input] of Object.entries(solutions))
  test(`${id} distinguishes an incomplete attempt from its training solution`, () => {
    assert.equal(evaluatePracticeLab(id, {}).completed, false);
    const solved = evaluatePracticeLab(id, input);
    assert.equal(solved.completed, true);
    assert.match(solved.flag, /^BB\{/);
  });
test('training inputs never resolve real files or external endpoints', () => {
  assert.match(
    evaluatePracticeLab('path-traversal', { filename: '/etc/passwd' }).output.content,
    /No real server file/
  );
  assert.equal(
    evaluatePracticeLab('data-exposure', { endpoint: 'not-a-profile' }).completed,
    false
  );
  assert.equal(evaluatePracticeLab('unknown', {}), null);
  assert.equal(
    evaluatePracticeLab('sql-injection', { username: { payload: 'test' } }).completed,
    false
  );
});
test('practice API works without database credentials and validates requests', async () => {
  const server = createAppServer({
    adminAuth: false,
    userAuth: false,
    database: {
      checkConnection() {
        throw new Error('Must not access database');
      },
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/practice/`;
  try {
    for (const [id, input] of Object.entries(solutions)) {
      const response = await fetch(base + id, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      assert.equal(response.status, 200);
      assert.equal((await response.json()).completed, true);
    }
    assert.equal((await fetch(base + 'idor')).status, 405);
    assert.equal((await fetch(base + 'unknown', { method: 'POST', body: '{}' })).status, 404);
    assert.equal((await fetch(base + 'idor', { method: 'POST', body: 'null' })).status, 400);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
