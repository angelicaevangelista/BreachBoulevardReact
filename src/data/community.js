export const communityStreets = [
  {
    id: 'main-street',
    name: 'Main Street',
    tagline: 'Introductions, wins and big announcements. Everyone starts here.',
    icon: 'spark',
  },
  {
    id: 'recon-row',
    name: 'Recon Row',
    tagline: 'Mapping targets, reading responses and asking how things really work.',
    icon: 'eye',
  },
  {
    id: 'payload-alley',
    name: 'Payload Alley',
    tagline: 'Injection tricks, input games and SQL curiosity.',
    icon: 'terminal',
  },
  {
    id: 'patch-parkway',
    name: 'Patch Parkway',
    tagline: 'Defence, fixes and secure code reviews.',
    icon: 'shield',
  },
  {
    id: 'cipher-court',
    name: 'Cipher Court',
    tagline: 'Sessions, tokens, logins and who is allowed to see what.',
    icon: 'key',
  },
  {
    id: 'honeypot-heights',
    name: 'Honeypot Heights',
    tagline: 'Stuck? Ask here. Honey and the crew will help you find the way.',
    icon: 'help',
  },
];

export const communityBlocks = [
  { minLabs: 0, title: 'Pedestrian', note: 'Just arrived on the boulevard.' },
  { minLabs: 1, title: 'Street Regular', note: 'You know the corners by now.' },
  { minLabs: 3, title: 'Block Captain', note: 'Other learners ask you for directions.' },
  { minLabs: 5, title: 'Boulevard Legend', note: 'Your name is painted on the lamp posts.' },
];

export const communityLimits = {
  title: { min: 3, max: 120 },
  post: { min: 5, max: 2000 },
  comment: { min: 1, max: 600 },
};

export function rankFor(completed) {
  const count = Math.max(0, Number(completed) || 0);
  let index = 0;
  communityBlocks.forEach((block, position) => {
    if (count >= block.minLabs) index = position;
  });
  const current = communityBlocks[index];
  const next = communityBlocks[index + 1];
  const span = next ? next.minLabs - current.minLabs : 0;
  const progress = next ? Math.round(((count - current.minLabs) / span) * 100) : 100;
  return {
    ...current,
    completed: count,
    progress,
    nextTitle: next ? next.title : '',
    labsToNext: next ? next.minLabs - count : 0,
  };
}
