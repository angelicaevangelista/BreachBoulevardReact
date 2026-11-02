import fs from 'node:fs';
import { profileAvatars } from '../src/data/avatars.js';
fs.mkdirSync('public/avatars', { recursive: true });
const e = (x, y, rx, ry, fill) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const p = (d, fill, stroke = 'none', width = 2) =>
  `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect = (x, y, w, h, r, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const flower = (x, y) =>
  `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cy="-3" rx="2.3" ry="3.2" transform="rotate(${a})" fill="#fff4dc"/>`).join('')}${e(0, 0, 2, 2, '#e1a253')}</g>`;
const eyes = (sleepy) =>
  sleepy
    ? p('M36 45q4-4 8 0m8 0q4-4 8 0', 'none', '#604832', 2.4)
    : [40, 56]
        .map((x) => e(x, 44, 3.4, 4.2, '#594331') + e(x - 1, 42.5, 1.1, 1.1, '#fff8e8'))
        .join('');
const styles = {
  'honey-bee': ['#f5e9cc', '#f4cc77', ''],
  'bookworm-bee': [
    '#e5eadf',
    '#e7c381',
    p(
      'M34 43a6 6 0 1 0 12 0 6 6 0 1 0-12 0m16 0a6 6 0 1 0 12 0 6 6 0 1 0-12 0M46 43h4',
      'none',
      '#685a47',
      1.7
    ) +
      p('M33 65q8-3 15 2 7-5 15-2v17q-8-3-15 1-7-4-15-1Z', '#7b9d89', '#f2e5c5', 1) +
      p('M48 68v14', 'none', '#f2e5c5', 1),
  ],
  'detective-bee': [
    '#e9e4da',
    '#e5bf7d',
    rect(31, 10, 34, 18, 5, '#ae8e6a') +
      rect(25, 25, 46, 6, 3, '#8b6f52') +
      rect(32, 21, 32, 4, 1, '#d2b88d') +
      p('m67 69 8 10', 'none', '#8c6d51', 4) +
      e(65, 65, 8.5, 8.5, '#d9ecde') +
      p('M59 65a6 6 0 1 0 12 0 6 6 0 1 0-12 0', 'none', '#688c7c', 2) +
      p('m62 61 3-1', 'none', '#fff9e9', 1.5),
  ],
  'explorer-bee': [
    '#e5ebd9',
    '#efd08a',
    rect(29, 13, 38, 17, 9, '#b4bb8c') +
      e(48, 28, 26, 5, '#8d9d74') +
      rect(33, 22, 30, 4, 1, '#e4d2a1') +
      p('M38 63 48 73 58 63v17H38Z', '#b1ad80') +
      p('m37 65 20 16', 'none', '#7c7859', 3),
  ],
  'artist-bee': [
    '#eee3e7',
    '#f0c784',
    e(48, 21, 23, 10, '#b18c9e') +
      p('M48 12q0-5 5-5', 'none', '#785c71', 3) +
      p('m27 66 7-9', 'none', '#a07858', 3) +
      p('m33 58 4-7 2 2-4 7Z', '#c78290') +
      e(66, 72, 10, 8, '#e4c69c') +
      e(61, 69, 2, 2, '#9bab80') +
      e(68, 68, 2, 2, '#b88aa0') +
      e(70, 74, 2, 2, '#cb9e57'),
  ],
  'garden-bee': [
    '#e2ebde',
    '#edcf86',
    [32, 42, 53, 64].map((x) => flower(x, 27)).join('') +
      p('m35 70 4-7m18 13 3-9', 'none', '#8d9e72', 2) +
      p('M36 74h24l-4 11H40Z', '#c39073') +
      p('M36 71h24', 'none', '#e5b094', 4) +
      flower(48, 65),
  ],
  'cosmic-bee': [
    '#e2e9f0',
    '#e6c38b',
    `<circle cx="48" cy="43" r="31" fill="none" stroke="#aabfcf" stroke-width="3"/>` +
      p('M24 34q4-12 12-15', 'none', '#fff8e8', 3) +
      rect(34, 66, 28, 16, 5, '#a9bdcc') +
      rect(42, 69, 12, 8, 2, '#6e8798') +
      e(45, 72, 1, 1, '#f6db96') +
      p('m77 19 2 4 4 1-4 1-2 4-1-4-4-1 4-1Z', '#c8a46b'),
  ],
  'royal-bee': [
    '#eee4ed',
    '#f0cd82',
    p('m30 14 9 7 9-13 9 13 9-7-4 16H34Z', '#dfb461', '#fff0bc', 1.2) +
      e(48, 22, 2.6, 3.2, '#ba879d') +
      p('M32 63q16 16 32 0l-2 19H34Z', '#a68ca9') +
      e(48, 71, 2.2, 2.2, '#f6d992'),
  ],
  'sleepy-bee': [
    '#e7e5f1',
    '#e4c885',
    p('M28 29q11-24 36-18l7 9q-15-5-20 8Z', '#a3a4c3') +
      p('M28 30h35', 'none', '#ded9ed', 5) +
      e(73, 21, 5, 5, '#f6f0dd') +
      p('M35 66q13 6 26 0v15H35Z', '#b8b4d1') +
      p('m42 70 1.5 3 3 1-3 1-1.5 3-1-3-3-1 3-1Z', '#fff0ce'),
  ],
  'strawberry-bee': [
    '#f1e2e1',
    '#efcf8a',
    p('M29 30q0-19 19-19t19 19Z', '#d39594') +
      p('m39 16 4-8 5 5 5-5 5 8-10-3Z', '#99aa7d') +
      [36, 46, 56, 62].map((x, i) => e(x, 24 - (i % 2) * 5, 1, 1.6, '#ffe5b9')).join('') +
      rect(35, 64, 26, 6, 3, '#c9908d') +
      p('m44 69-4 10 8-2 8 2-4-10', '#d9a09b'),
  ],
  'cozy-bee': [
    '#e9e6dc',
    '#ebc681',
    rect(31, 16, 34, 15, 7, '#b59b83') +
      p('M31 28h34', 'none', '#e1c2a1', 5) +
      e(48, 12, 5, 5, '#d6b79a') +
      p('M32 61q16 8 32 0v7q-16 8-32 0Z', '#c19b83') +
      p('m52 68-2 16h9l-1-16', '#e0b99c') +
      p('M53 79h4', 'none', '#b28b74', 1),
  ],
  'chef-bee': [
    '#f1e9df',
    '#efca80',
    e(36, 18, 9, 9, '#fff8e8') +
      e(48, 13, 10, 10, '#fff8e8') +
      e(60, 18, 9, 9, '#fff8e8') +
      rect(33, 18, 30, 13, 3, '#fff8e8') +
      p('M36 27h24', 'none', '#e8d7ba', 2) +
      p('M35 64q13 5 26 0l2 18H33Z', '#fff1d5') +
      p('M48 67v13', 'none', '#c7b290', 1) +
      e(53, 71, 1.2, 1.2, '#b39677') +
      e(53, 76, 1.2, 1.2, '#b39677'),
  ],
  'music-bee': [
    '#e9e3ef',
    '#edc682',
    p('M22 45V34a26 26 0 0 1 52 0v11', 'none', '#a79ab7', 5) +
      rect(19, 37, 9, 19, 4, '#bfb1cb') +
      rect(68, 37, 9, 19, 4, '#bfb1cb') +
      p('m76 64 9-2v11', 'none', '#9885a8', 2) +
      e(82, 74, 3, 2, '#9885a8'),
  ],
  'wizard-bee': [
    '#e6e4ee',
    '#eac882',
    p('m27 30 20-27 21 27Z', '#9b92b7') +
      e(48, 30, 26, 4, '#82779e') +
      p('m46 14 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z', '#f5dca4') +
      p('M33 65q15 7 30 0l-1 17H34Z', '#b3a5c9') +
      p('m69 64 5 16', 'none', '#a28160', 2.5) +
      p('m68 59 2 3 4 1-4 2-1 4-2-4-4-1 4-2Z', '#efc67d'),
  ],
  'bow-bee': [
    '#f2e3e5',
    '#efce88',
    p('M65 29q-14-14-14-2 0 9 14 4 13 7 14-3 1-11-14 1Z', '#cf98a4') +
      e(65, 30, 3, 4, '#b97e91') +
      p('M35 65q13 6 26 0v6q-13 6-26 0Z', '#dcacb6') +
      e(48, 70, 2, 2, '#fff0d5'),
  ],
};
for (const avatar of profileAvatars) {
  const [bg, honey, accessory] = styles[avatar.id];
  const wings = `<ellipse cx="24" cy="55" rx="11" ry="17" transform="rotate(-28 24 55)" fill="#fdf9ed" stroke="#c0d5cf" stroke-width="1.5"/><ellipse cx="72" cy="55" rx="11" ry="17" transform="rotate(28 72 55)" fill="#fdf9ed" stroke="#c0d5cf" stroke-width="1.5"/>`;
  const body =
    e(48, 68, 18, 17, honey) + p('M32 68q16 7 32 0m-28 10q12 5 24 0', 'none', '#80664a', 5);
  const antennas =
    p('M37 28q-2-10-6-14m28 14q2-10 6-14', 'none', '#8f744f', 2.5) +
    e(31, 12, 3, 3, honey) +
    e(65, 12, 3, 3, honey);
  const face =
    e(48, 44, 25, 23, honey) +
    p('M31 32q5-6 11-6', 'none', '#ffe9b7', 2.5) +
    eyes(avatar.id === 'sleepy-bee') +
    e(32, 53, 4.5, 2.6, '#e7a49c') +
    e(64, 53, 4.5, 2.6, '#e7a49c') +
    p('M43 54q5 6 10 0', 'none', '#77523c', 2.3);
  fs.writeFileSync(
    `public/avatars/${avatar.id}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><title>${avatar.name}</title>${rect(0, 0, 96, 96, 28, bg)}${e(48, 87, 22, 3, '#6b58420c')}${wings}${body}${antennas}${face}${accessory}</svg>\n`
  );
}
const hex = (x, y, fill) => p(`m${x} ${y - 14} 12 7v14l-12 7-12-7V${y - 7}Z`, fill, '#fff0c8', 2);
const comb = [
  [48, 48, '#edb55d'],
  [23, 48, '#f4ca7e'],
  [73, 48, '#f4ca7e'],
  [35.5, 26.5, '#f7d99c'],
  [60.5, 26.5, '#f0c16e'],
  [35.5, 69.5, '#efbf6d'],
  [60.5, 69.5, '#f6d394'],
]
  .map(([x, y, fill]) => hex(x, y, fill))
  .join('');
fs.writeFileSync(
  'public/avatars/honeycomb.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96"><title>Honeycomb</title>${rect(0, 0, 96, 96, 28, '#fbf1dc')}${comb}</svg>\n`
);
console.log('Generated 15 bee styles and a plain honeycomb default.');
