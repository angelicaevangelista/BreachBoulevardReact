import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHoneyService } from '../server/honey.mjs';
const examples = [
  ['hi', /Hi, I'm Honey/],
  ['Hello, Honey!', /helper bee/],
  ['Honey hello', /helper bee/],
  ['Hi Honey, how are you?', /buzzing happily/],
  ['how’s your day?', /buzzing happily/],
  ['How are u', /buzzing happily/],
  ['What is your favorite color?', /Honey orange.*midnight navy/],
  ['Your favourite colour?', /Honey orange/],
  ["What's your favorite place in Breach Boulevard?", /Streak Garden.*Main Street/],
  ['Where do you live?', /bottom-right corner/],
  ['What is your favorite food?', /digital bee/],
  ['What is your favorite lab?', /Neighborly.*Easy CTFs/],
  ['What do you do for fun?', /victory dances/],
  ['Are you real?', /digital bee.*real world/],
  ['Why are you called Honey?', /learning sticks/i],
  ['Tell me a joke', /phish-y/],
  ['Tell me a fun fact', /server.*permission/],
  ['How do streaks work?', /one lab each day/],
  ['I got the flag!', /Bzz-illiant.*submit it/],
  ["I'm tired", /Little wings/],
  ['Cheer me up', /slow discovery/],
  ["I'm good", /wings wiggle/],
  ['good!', /wing-wiggle/],
  ['Thank you', /welcome/],
  ["You're cute", /hand-heart/],
  ['Goodnight Honey', /rest/],
  ['Bye!', /Bzz-bye/],
];
for (const [message, expected] of examples)
  test(`Honey small talk: ${message}`, async () => {
    const result = await createHoneyService().chat({
      client: 'learner',
      input: { message, labId: 'sql-injection', hintIndex: 1 },
    });
    assert.equal(result.status, 200);
    assert.match(result.body.reply, expected);
    assert.equal(result.body.nextHintIndex, 1, 'Small talk must not advance lab hints');
    assert.equal(result.body.hasMoreHints, true);
  });
test('explicit lab assistance wins over a greeting or personal conversation', async () => {
  const result = await createHoneyService().chat({
    client: 'learner',
    input: {
      message: 'Hi Honey, I am stuck. Give me the next hint.',
      labId: 'sql-injection',
      hintIndex: 0,
    },
  });
  assert.equal(result.body.nextHintIndex, 1);
  assert.doesNotMatch(result.body.reply, /How's your day/);
});
test('casual chat never fabricates account progress or personal data', async () => {
  const service = createHoneyService();
  for (const message of ['what is my streak?', 'I got a flag!', 'thanks']) {
    const result = await service.chat({ client: 'learner', input: { message } });
    assert.deepEqual(
      Object.keys(result.body).sort(),
      ['success', 'reply', 'nextHintIndex', 'hasMoreHints'].sort()
    );
    assert.doesNotMatch(result.body.reply, /your streak is \d|saved your completion/i);
  }
});
