export const profileAvatars = [
  ['honey-bee', 'Honey bee', 'Your sunny little sidekick'],
  ['peach-cat', 'Peach kitten', 'A curious little explorer'],
  ['mint-frog', 'Mint frog', 'One happy little hop'],
  ['cloud-bunny', 'Cloud bunny', 'Soft ears, brave heart'],
  ['lavender-owl', 'Lavender owl', 'A thoughtful night owl'],
  ['cocoa-puppy', 'Cocoa puppy', 'Here for every little win'],
  ['red-panda', 'Red panda', 'A cozy problem solver'],
  ['honey-bear', 'Honey bear', 'Sweet, steady, and curious'],
  ['sleepy-koala', 'Sleepy koala', 'Learning at your own pace'],
  ['maple-fox', 'Maple fox', 'Always following a clue'],
  ['butter-chick', 'Butter chick', 'A bright new beginning'],
  ['ice-penguin', 'Ice penguin', 'Cool under pressure'],
  ['pink-axolotl', 'Pink axolotl', 'A little different, a lot of heart'],
  ['moon-seal', 'Moon seal', 'Small steps, soft landings'],
  ['strawberry-mushroom', 'Strawberry mushroom', 'Growing one discovery at a time'],
].map(([id, name, description]) => ({ id, name, description }));
export const defaultAvatarId = 'honey-bee';
export function profileAvatar(id) {
  return profileAvatars.find((avatar) => avatar.id === id) || profileAvatars[0];
}
