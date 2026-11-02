import React, { createContext, useContext, useSyncExternalStore } from 'react';

export { routePaths } from './data/routes.js';
import { routePaths, resolveRoute } from './data/routes.js';

let appBase = '';
export function configureBase(value = '') {
  appBase = value.replace(/\/$/, '');
}
export function assetUrl(value) {
  return `${appBase}/${value.replace(/^\//, '')}`;
}
export function resolvePage(pathname) {
  return resolveRoute(pathname, appBase);
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
