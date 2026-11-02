import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateProfile, safeAvatarId } from '../server/profile.mjs';
import { profileAvatars } from '../src/data/avatars.js';
import { publicUser } from '../server/learner-auth.mjs';
test('15 original avatars are available and only catalog IDs can be saved', () => {
  assert.equal(profileAvatars.length, 15);
  assert.equal(new Set(profileAvatars.map((a) => a.id)).size, 15);
  for (const avatar of profileAvatars) {
    assert.match(fs.readFileSync(`public/avatars/${avatar.id}.svg`, 'utf8'), /<svg/);
    assert.equal(
      validateProfile({ name: 'A', organization: '', avatarId: avatar.id }).bb_avatar_id,
      avatar.id
    );
  }
  assert.equal(safeAvatarId('../../secrets'), 'honey-bee');
});
test('profile edits accept bounded plain text and reject ownership, auth, or progress changes', () => {
  assert.deepEqual(
    validateProfile({
      name: '  Bee Learner  ',
      organization: 'Campus & Co.',
      avatarId: 'peach-cat',
    }),
    { bb_display_name: 'Bee Learner', bb_organization: 'Campus & Co.', bb_avatar_id: 'peach-cat' }
  );
  for (const input of [
    null,
    [],
    {},
    ...['', 'a'.repeat(61), '<img src=x>', 'Hello\nWorld'].map((name) => ({
      name,
      organization: '',
      avatarId: 'peach-cat',
    })),
    { name: 'Bee', organization: 'a'.repeat(121), avatarId: 'peach-cat' },
    { name: 'Bee', organization: 'Campus', avatarId: 'https://evil.test/avatar.svg' },
    ...['userId', 'role', 'password', 'email', 'bb_completed_labs'].map((key) => ({
      name: 'Bee',
      organization: '',
      avatarId: 'peach-cat',
      [key]: 'other',
    })),
  ])
    assert.throws(() => validateProfile(input));
});
test('session profile exposes only display data and allowlisted avatars', () => {
  const user = publicUser({
    id: 'one',
    email: 'one@example.com',
    user_metadata: {
      full_name: 'Bee',
      bb_organization: 'Campus',
      bb_avatar_id: 'mint-frog',
      bb_completed_labs: ['idor'],
      secret: 'hidden',
    },
  });
  assert.deepEqual(user, {
    id: 'one',
    email: 'one@example.com',
    name: 'Bee',
    organization: 'Campus',
    avatarId: 'mint-frog',
  });
});
