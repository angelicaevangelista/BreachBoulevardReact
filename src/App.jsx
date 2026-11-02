import React, { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import pages from './pages.json';
import registry from './registry';
import AdminGate from './components/AdminGate';
import LearnerGate from './components/LearnerGate';
import { PublicHoneyAssistant } from './components/HoneyAssistant';
import ThemeToggle from './components/ThemeToggle';
import { assetUrl, Link, resolvePage, routePaths, useRouter } from './routing';

function DocumentFrame({ page, children }) {
  useLayoutEffect(() => {
    const previous = {
      title: document.title,
      className: document.body.className,
      style: document.body.getAttribute('style'),
    };
    document.title = page.title;
    document.body.className = page.body.class || '';
    document.body.removeAttribute('style');
    if (page.body.style) document.body.setAttribute('style', page.body.style);
    return () => {
      document.title = previous.title;
      document.body.className = previous.className;
      if (previous.style === null) document.body.removeAttribute('style');
      else document.body.setAttribute('style', previous.style);
    };
  }, [page]);
  return (
    <>
      {createPortal(
        <>
          {page.tailwind && <link rel="stylesheet" href={assetUrl('styles/tailwind.css')} />}
          {page.links
            .filter((link) => !/icon/i.test(link.rel))
            .map((link, index) => (
              <link
                key={index}
                {...link}
                href={
                  /^(https?:|\/\/)/.test(link.href)
                    ? link.href
                    : assetUrl(link.href.toLowerCase() === 'bblogo.png' ? 'BBLOGO.png' : link.href)
                }
              />
            ))}
          {page.css && <style>{page.css}</style>}
        </>,
        document.head
      )}
      {children}
    </>
  );
}
export default function App() {
  const { location, navigate } = useRouter();
  const pathname = location.split(/[?#]/)[0];
  const source = resolvePage(pathname);
  const page = pages.find((item) => item.path === source);
  const Page = registry[source];
  useLayoutEffect(() => {
    if (!source) return;
    window.scrollTo?.(0, 0);
    if (source === 'practice.html' && pathname.startsWith(assetUrl('practice/'))) return;
    const canonical = assetUrl(routePaths[source]);
    if (pathname !== canonical)
      navigate(routePaths[source] + window.location.search + window.location.hash, {
        replace: true,
      });
  }, [pathname, source, navigate]);
  if (!Page)
    return (
      <main className="p-6">
        <h1>Page not found</h1>
        <Link to="/">Return to Breach Boulevard</Link>
      </main>
    );
  return (
    <DocumentFrame key={source} page={page}>
      {![
        'testcopy2.html',
        'practice.html',
        'labs.html',
        'content/main.html',
        'dashboard.html',
        'community.html',
        'access/access.html',
        'access/admin.html',
      ].includes(source) && <ThemeToggle className="bb-theme-standalone" />}
      {source === 'access/admin.html' ? (
        <AdminGate>
          <Page />
        </AdminGate>
      ) : ![
          'testcopy2.html',
          'privacy.html',
          'about.html',
          'faq.html',
          'test.html',
          'testcopy.html',
          'landingpage.html',
          'landingpagetest.html',
        ].includes(source) ? (
        <LearnerGate
          integrated={[
            'practice.html',
            'labs.html',
            'content/main.html',
            'dashboard.html',
            'community.html',
          ].includes(source)}
        >
          <Page />
        </LearnerGate>
      ) : (
        <>
          <Page />
          <PublicHoneyAssistant />
        </>
      )}
    </DocumentFrame>
  );
}
