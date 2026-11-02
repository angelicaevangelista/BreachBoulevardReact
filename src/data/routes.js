export const routePaths = {
  'account-profile.html': '/account/profile',
  'dashboard.html': '/dashboard',
  'missions.html': '/missions',
  'community.html': '/community',
  'privacy.html': '/privacy',
  'reset-password.html': '/reset-password',
  'practice.html': '/practice',
  'testcopy2.html': '/',
  'about.html': '/about',
  'access/access.html': '/access',
  'access/admin.html': '/admin',
  'access/main.html': '/access/protected',
  'content/main.html': '/courses',
  'cards.html': '/cards',
  'csrf.html': '/labs/csrf',
  'dom.html': '/labs/dom-xss',
  'faq.html': '/faq',
  'file-injection.html': '/labs/file-injection',
  'IDOR.html': '/labs/idor',
  'index.html': '/labs/reflected-xss',
  'labs.html': '/labs',
  'landingpage.html': '/demos/landing',
  'landingpagetest.html': '/demos/landing-test',
  'profile.html': '/profile/upload',
  'profile2.html': '/profile',
  'terminal.html': '/demos/terminal',
  'terminalfeature.html': '/terminal/network',
  'terminal/terminal.html': '/terminal/linux',
  'test.html': '/demos/home',
  'testcopy.html': '/demos/home-copy',
  'tutorial/Union-based-sql-injection.html': '/tutorial/sql-injection',
  'upload.html': '/upload',
  'uploads/index.html': '/labs/uploaded-xss',
  'vulnerabilities/error-based-sql-injection.html': '/labs/error-sql',
  'vulnerabilities/union-based-sql-injection.html': '/labs/union-sql',
  'XSS.html': '/labs/xss',
  'testupload.html': '/labs/file-upload',
};

import { practiceLabs } from './practice-labs.js';
export function resolveRoute(pathname, base = '') {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (base && decoded !== base && !decoded.startsWith(base + '/')) return null;
  const local = decoded.slice(base.length) || '/';
  const clean = local.length > 1 ? local.replace(/\/$/, '') : local;
  if (clean === '/practice') return 'practice.html';
  const challenge = clean.match(/^\/practice\/([a-z-]+)$/);
  if (challenge)
    return practiceLabs.some((lab) => lab.id === challenge[1]) ? 'practice.html' : null;
  return (
    Object.keys(routePaths).find((key) => routePaths[key] === clean) ||
    Object.keys(routePaths).find((key) => '/' + key === clean) ||
    null
  );
}
