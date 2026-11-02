import React, { useEffect, useState } from 'react';
export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'dark');
  useEffect(() => {
    const sync = () => setTheme(document.documentElement.dataset.theme || 'dark');
    const change = (event) => {
      if (event.key && event.key !== 'bb.theme') return;
      let saved;
      try {
        saved = localStorage.getItem('bb.theme');
      } catch {}
      const mode =
        saved === 'light' || saved === 'dark'
          ? saved
          : window.matchMedia?.('(prefers-color-scheme: light)').matches
            ? 'light'
            : 'dark';
      document.documentElement.dataset.theme = mode;
      document.documentElement.style.colorScheme = mode;
      sync();
    };
    const system = window.matchMedia?.('(prefers-color-scheme: light)');
    window.addEventListener('bb-theme-change', sync);
    window.addEventListener('storage', change);
    system?.addEventListener?.('change', change);
    return () => {
      window.removeEventListener('bb-theme-change', sync);
      window.removeEventListener('storage', change);
      system?.removeEventListener?.('change', change);
    };
  }, []);
  function toggle() {
    const mode = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
    try {
      localStorage.setItem('bb.theme', mode);
    } catch {}
    window.dispatchEvent(new Event('bb-theme-change'));
    setTheme(mode);
  }
  return (
    <button
      type="button"
      className={'bb-theme-toggle ' + className}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <svg
        viewBox="0 0 24 24"
        width="17"
        height="17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        aria-hidden="true"
      >
        {theme === 'dark' ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
          </>
        ) : (
          <path d="M20.5 14.4A8.5 8.5 0 0 1 9.6 3.5a8.5 8.5 0 1 0 10.9 10.9Z" />
        )}
      </svg>
      <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
    </button>
  );
}
