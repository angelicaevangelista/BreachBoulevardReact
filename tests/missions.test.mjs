import { test } from 'node:test';
import assert from 'node:assert/strict';
import { missionCases } from '../src/data/missions.js';
import { findPracticeLab } from '../src/data/practice-labs.js';
import { createMissionService } from '../server/missions.mjs';
import { createAppServer } from '../server/index.mjs';
const answers = [
  'id-permission',
  'tenant-fields',
  'server-preview',
  'trusted-price',
  'normalize-first',
  'csrf-check',
  'trace-traversal',
  'inherited-permission',
  'parsed-host',
];
import { memoryMissionStore } from './fixtures/missions.mjs';

test('three stories contain nine linked chapters and 27 distinct evidence files', () => {
  assert.equal(missionCases.length, 3);
  const files = [];
  for (const file of missionCases) {
    assert.equal(file.chapters.length, 3);
    for (const c of file.chapters) {
      assert.ok(findPracticeLab(c.labId));
      assert.equal(c.evidence.length, 3);
      assert.equal(c.evidence.filter((e) => e.afterLab).length, 1);
      files.push(...c.evidence.map((e) => e.id));
    }
  }
  assert.equal(new Set(files).size, 27);
});
for (const [caseIndex, caseFile] of missionCases.entries())
  test(`${caseFile.id}: collect evidence, complete linked labs, and file all three deductions`, async () => {
    const service = createMissionService({ store: memoryMissionStore() }),
      userId = 'learner-a',
      completed = caseFile.chapters.map((c) => c.labId);
    let revision = 0;
    const act = async (input) => {
      const result = await service({
        userId,
        completed,
        method: 'POST',
        input: { ...input, caseId: caseFile.id, revision },
      });
      revision = result.case.revision;
      return result;
    };
    for (const [i, c] of caseFile.chapters.entries()) {
      await assert.rejects(
        () => act({ type: 'deduce', chapterId: c.id, choiceId: answers[caseIndex * 3 + i] }),
        { status: 409 }
      );
      for (const e of c.evidence)
        await act({ type: 'pin', chapterId: c.id, evidenceId: e.id, pinned: true });
      const wrong = c.choices.find((x) => x.id !== answers[caseIndex * 3 + i]);
      const rejected = await act({ type: 'deduce', chapterId: c.id, choiceId: wrong.id });
      assert.equal(rejected.correct, false);
      assert.equal(rejected.case.state.solved.length, i);
      const accepted = await act({
        type: 'deduce',
        chapterId: c.id,
        choiceId: answers[caseIndex * 3 + i],
      });
      assert.equal(accepted.correct, true);
      assert.equal(accepted.case.state.solved.length, i + 1);
    }
    const restored = await service({ userId });
    assert.equal(restored.cases.find((c) => c.caseId === caseFile.id).state.solved.length, 3);
    assert.ok(
      (await service({ userId: 'learner-b' })).cases.every((c) => c.state.solved.length === 0)
    );
  });
test('future chapters, unrecovered files, stale revisions, and invalid notes are rejected', async () => {
  const service = createMissionService({ store: memoryMissionStore() }),
    c = missionCases[0];
  const act = (input) =>
    service({ userId: 'a', method: 'POST', input: { caseId: c.id, revision: 0, ...input } });
  await assert.rejects(
    () => act({ type: 'reply', chapterId: c.chapters[1].id, replyId: c.chapters[1].replies[0].id }),
    { status: 403 }
  );
  await assert.rejects(
    () =>
      act({
        type: 'pin',
        chapterId: c.chapters[0].id,
        evidenceId: c.chapters[0].evidence[2].id,
        pinned: true,
      }),
    { status: 403 }
  );
  await assert.rejects(() => act({ type: 'note', text: 'a'.repeat(1201) }), { status: 400 });
  const saved = await act({
    type: 'note',
    text: '<script>not executed</script>',
    userId: 'forged',
  });
  assert.equal(saved.case.state.note, '<script>not executed</script>');
  await assert.rejects(() => act({ type: 'note', text: 'outdated' }), { status: 409 });
  assert.equal((await service({ userId: 'forged' })).cases[0].state.note, '');
  await assert.rejects(() => service({ method: 'GET' }), { status: 401 });
});
test('mission API verifies an account and origin before reading or writing private case state', async () => {
  let signedIn = false;
  const server = createAppServer({
    missionStore: memoryMissionStore(),
    userAuth: (req) => ({
      origin: 'http://' + req.headers.host,
      handle: async () => false,
      requireUser: async () => {
        if (!signedIn) {
          const { AuthError } = await import('../server/learner-auth.mjs');
          throw new AuthError(401, 'Sign in required.');
        }
        return { id: 'account-a', user_metadata: {} };
      },
    }),
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    assert.equal((await fetch(base + '/api/missions')).status, 401);
    signedIn = true;
    assert.equal(
      (
        await fetch(base + '/api/missions', {
          method: 'POST',
          headers: { Origin: 'https://wrong.invalid' },
          body: '{}',
        })
      ).status,
      403
    );
    const result = await fetch(base + '/api/missions', {
      method: 'POST',
      headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: 'midnight-premiere',
        revision: 0,
        type: 'note',
        text: 'A clue to revisit',
        userId: 'account-b',
      }),
    });
    assert.equal(result.status, 200);
    assert.equal((await result.json()).case.state.note, 'A clue to revisit');
    assert.equal(result.headers.get('cache-control'), 'no-store');
    assert.equal(
      (await fetch(base + '/api/missions', { method: 'DELETE', headers: { Origin: base } })).status,
      405
    );
  } finally {
    server.closeAllConnections();
    await new Promise((r) => server.close(r));
  }
});
