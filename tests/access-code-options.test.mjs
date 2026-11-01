import { test } from 'node:test';
import assert from 'node:assert/strict';
import { accessCodeOptions } from '../server/access-code-options.mjs';
const now = new Date('2028-01-31T10:15:00.000Z');
test('code expiry supports days and calendar months with month-end clamping', () => {
  for (const [duration, expected] of [
    ['1-day', '2028-02-01'],
    ['7-days', '2028-02-07'],
    ['1-month', '2028-02-29'],
    ['6-months', '2028-07-31'],
    ['1-year', '2029-01-31'],
  ])
    assert.equal(accessCodeOptions({ duration }, now).expiresAt, expected + 'T10:15:00.000Z');
  assert.equal(
    accessCodeOptions({ duration: '1-year' }, new Date('2028-02-29T00:00:00Z')).expiresAt,
    '2029-02-28T00:00:00.000Z'
  );
});
test('custom expiry and custom codes are validated before database access', () => {
  assert.deepEqual(
    accessCodeOptions(
      {
        duration: 'custom',
        expiresAt: '2028-05-01T09:00:00.000Z',
        codeMode: 'custom',
        code: ' CLASS-2028 ',
      },
      now
    ),
    { code: 'CLASS-2028', expiresAt: '2028-05-01T09:00:00.000Z' }
  );
  for (const input of [
    { duration: 'forever' },
    { codeMode: 'unknown' },
    { duration: 'custom', expiresAt: '2028-01-01T00:00:00Z' },
    { duration: 'custom', expiresAt: '2028-02-31T00:00:00Z' },
    { duration: 'custom', expiresAt: '2028-05-01T00:00' },
    { codeMode: 'custom', code: 'ab' },
    { codeMode: 'custom', code: 'code with spaces' },
    { codeMode: 'custom', code: "'; DROP TABLE codes;--" },
  ])
    assert.throws(
      () => accessCodeOptions(input, now),
      (error) => error.status === 400
    );
});
