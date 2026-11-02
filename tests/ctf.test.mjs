import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ctfLabs } from '../src/data/ctf-labs.js';
import { practiceLabs } from '../src/data/practice-labs.js';
import { evaluatePracticeLab as evaluate } from '../server/practice-labs.mjs';
import { ctfSolutions } from './fixtures/ctf-solutions.mjs';
const context = { actorId: 'learner-a', proofKey: 'test-only-ctf-proof-key', now: 100000 };
test('catalog has 21 unique websites and exactly five CTFs at each level', () => {
  assert.equal(practiceLabs.length, 21);
  assert.equal(new Set(practiceLabs.map((l) => l.platform.name)).size, 21);
  assert.equal(new Set(practiceLabs.map((l) => l.id)).size, 21);
  for (const level of ['Easy', 'Medium', 'Hard'])
    assert.equal(ctfLabs.filter((l) => l.difficulty === level).length, 5);
});
for (const lab of ctfLabs)
  test(`${lab.id}: discover, recover, and submit a per-account flag`, () => {
    const initial = Object.fromEntries(lab.fields.map((f) => [f.key, f.initial]));
    assert.equal(evaluate(lab.id, initial, context).output.recoveredFlag, undefined);
    const [first, second] = ctfSolutions[lab.id];
    let recovered = evaluate(lab.id, first, context);
    if (second) {
      assert.equal(
        evaluate(lab.id, { ...second, stage: 'skip-discovery' }, context).output.status,
        400
      );
      assert.equal(recovered.output.discoveryComplete, true);
      assert.ok(recovered.proof);
      assert.equal(evaluate(lab.id, { ...second, stage: 'exploit' }, context).output.status, 403);
      recovered = evaluate(
        lab.id,
        { ...second, stage: 'exploit', proof: recovered.proof },
        context
      );
    }
    assert.equal(recovered.completed, false, 'Recovering alone must not save completion');
    const flag = recovered.output.recoveredFlag;
    assert.match(flag, /^BB\{[a-z_]+_[\w-]{12}\}$/);
    assert.equal(evaluate(lab.id, { action: 'submit-flag', flag }, context).completed, true);
    assert.equal(
      evaluate(lab.id, { action: 'submit-flag', flag }, { ...context, actorId: 'learner-b' })
        .completed,
      false
    );
    assert.equal(
      evaluate(lab.id, { action: 'submit-flag', flag: 'BB{invented}', completed: true }, context)
        .completed,
      false
    );
  });
test('hard discovery tickets reject expiry, tampering, other users, and other labs', () => {
  const id = 'ctf-devops-build';
  const discovery = evaluate(id, ctfSolutions[id][0], context);
  const payload = { ...ctfSolutions[id][1], stage: 'exploit', proof: discovery.proof };
  for (const [body, ctx] of [
    [{ ...payload, proof: payload.proof + 'x' }, context],
    [payload, { ...context, now: context.now + 30 * 60000 }],
    [payload, { ...context, actorId: 'learner-b' }],
    [
      { ...payload, proof: evaluate('ctf-course-replay', { revision: 'R6' }, context).proof },
      context,
    ],
  ])
    assert.equal(evaluate(id, body, ctx).output.status, 403);
});
test('simulation does not pollute prototypes, execute HTML, or contact an internal host', () => {
  assert.equal({}.canExport, undefined);
  evaluate('ctf-design-export', ctfSolutions['ctf-design-export'][0], context);
  assert.equal({}.canExport, undefined);
  const id = 'ctf-music-hook',
    proof = evaluate(id, ctfSolutions[id][0], context).proof;
  assert.equal(
    evaluate(id, { ...ctfSolutions[id][1], stage: 'exploit', proof }, context).output
      .networkRequestMade,
    false
  );
  assert.match(
    evaluate('ctf-blog-preview', ctfSolutions['ctf-blog-preview'][0], context).output.execution,
    /No real script ran/
  );
  assert.equal(evaluate('ctf-unknown', {}, context), null);
});
