import React, { createContext, useContext, useSyncExternalStore } from 'react';

export const routePaths = {
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

let appBase = '';
export function configureBase(value = '') {
  appBase = value.replace(/\/$/, '');
}
export function assetUrl(value) {
  return `${appBase}/${value.replace(/^\//, '')}`;
}
export function resolvePage(pathname) {
  const local = decodeURIComponent(pathname).slice(appBase.length) || '/';
  const clean = local.length > 1 ? local.replace(/\/$/, '') : local;
  if (/^\/practice(?:\/[a-z-]+)?$/.test(clean)) return 'practice.html';
  return (
    Object.keys(routePaths).find((key) => routePaths[key] === clean) ||
    Object.keys(routePaths).find((key) => '/' + key === clean)
  );
}
const getSnapshot = () => window.location.pathname + window.location.search + window.location.hash;
const subscribe = (callback) => {
  window.addEventListener('popstate', callback);
  window.addEventListener('bb:navigate', callback);
  return () => {
    window.removeEventListener('popstate', callback);
    window.removeEventListener('bb:navigate', callback);
  };
};
export function navigate(to, { replace = false } = {}) {
  window.history[replace ? 'replaceState' : 'pushState']({}, '', assetUrl(to));
  window.dispatchEvent(new Event('bb:navigate'));
}
const RouterContext = createContext(null);
export function Router({ children }) {
  const location = useSyncExternalStore(subscribe, getSnapshot, () => '/');
  return <RouterContext.Provider value={{ location, navigate }}>{children}</RouterContext.Provider>;
}
export const useRouter = () => useContext(RouterContext);
export function Link({ to, onClick, children, ...props }) {
  return (
    <a
      {...props}
      href={assetUrl(to)}
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          props.target === '_blank' ||
          props.download
        )
          return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
