import { profileAvatars, defaultAvatarId } from '../src/data/avatars.js';
export function validateProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Enter valid profile details.');
  if (Object.keys(input).some((key) => !['name', 'organization', 'avatarId'].includes(key)))
    throw new Error('Only your name, school/company, and avatar can be edited here.');
  const text = (value, max, required, label) => {
    if (typeof value !== 'string' || /[\u0000-\u001f\u007f<>]/.test(value))
      throw new Error(`Enter a valid ${label}.`);
    const clean = value.trim();
    if ((required && !clean) || clean.length > max)
      throw new Error(
        `${label} must be ${required ? '1–' : 'no more than '}${max} characters${required ? '' : ' long'}.`
      );
    return clean;
  };
  const name = text(input.name, 60, true, 'Display name');
  const organization = text(input.organization, 120, false, 'School or company');
  if (
    input.avatarId !== defaultAvatarId &&
    !profileAvatars.some((avatar) => avatar.id === input.avatarId)
  )
    throw new Error('Choose one of the available avatars.');
  return { bb_display_name: name, bb_organization: organization, bb_avatar_id: input.avatarId };
}
export function safeAvatarId(id) {
  return profileAvatars.some((avatar) => avatar.id === id) ? id : defaultAvatarId;
}
