export const profileAvatars = [
  ['honey-bee', 'Sunny bee', 'A little sunshine, a lot of curiosity'],
  ['bookworm-bee', 'Bookworm bee', 'One more page, one more discovery'],
  ['detective-bee', 'Detective bee', 'Always following the next little clue'],
  ['explorer-bee', 'Explorer bee', 'A tiny explorer with a brave heart'],
  ['artist-bee', 'Artist bee', 'A little color outside the lines'],
  ['garden-bee', 'Garden bee', 'Growing one discovery at a time'],
  ['cosmic-bee', 'Cosmic bee', 'Curiosity that reaches the stars'],
  ['royal-bee', 'Royal bee', 'A little confidence looks good on you'],
  ['sleepy-bee', 'Sleepy bee', 'Learning at your own cozy pace'],
  ['strawberry-bee', 'Berry bee', 'A sweet little spark of curiosity'],
  ['cozy-bee', 'Cozy bee', 'A warm scarf for a new adventure'],
  ['chef-bee', 'Chef bee', 'Cooking up your next discovery'],
  ['music-bee', 'Music bee', 'Finding your own learning rhythm'],
  ['wizard-bee', 'Wizard bee', 'A little wonder in every what if'],
  ['bow-bee', 'Ribbon bee', 'Small wins, tied up with a little joy'],
].map(([id, name, description]) => ({ id, name, description }));
export const defaultAvatarId = 'honeycomb';
export const defaultProfileAvatar = {
  id: defaultAvatarId,
  name: 'Honeycomb',
  description: 'Your simple little place in the hive',
};
export function profileAvatar(id) {
  return profileAvatars.find((avatar) => avatar.id === id) || defaultProfileAvatar;
}
