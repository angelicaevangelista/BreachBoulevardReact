import React, { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Brand, Icon, Mascot } from './Interface';
import ThemeToggle from './ThemeToggle';
import { Link } from '../routing';
export default function NotFound() {
  useLayoutEffect(() => {
    const previous = document.title;
    document.title = '404 · A little detour | Breach Boulevard';
    return () => {
      document.title = previous;
    };
  }, []);
  return (
    <div className="bb-ui bb-not-found">
      {createPortal(<meta name="robots" content="noindex, nofollow" />, document.head)}
      <nav className="bb-public-header">
        <Brand />
        <ThemeToggle />
      </nav>
      <main className="bb-lost-main">
        <span className="bb-eyebrow">
          <Icon name="spark" size={14} /> A LITTLE DETOUR ON THE BOULEVARD
        </span>
        <div className="bb-lost-scene" aria-hidden="true">
          <span className="bb-lost-number">4</span>
          <div className="bb-lost-hive">
            <span className="bb-lost-orbit" />
            <Mascot />
            <span className="bb-lost-note">wrong turn, little bee!</span>
          </div>
          <span className="bb-lost-number">4</span>
          <span className="bb-lost-star one">✦</span>
          <span className="bb-lost-star two">✧</span>
          <span className="bb-lost-star three">✦</span>
        </div>
        <span className="bb-tag bb-tag-orange">404 · Page not found</span>
        <h1>Oops, we took the scenic route.</h1>
        <p>
          Honey checked this little corner, but the page isn’t here.
          <br />
          Let’s buzz back to somewhere lovely.
        </p>
        <div className="bb-lost-actions">
          <Link className="bb-button bb-button-primary" to="/">
            <Icon name="back" size={16} /> Back to the Boulevard
          </Link>
          <Link className="bb-button bb-button-secondary" to="/practice">
            Find a little adventure
            <Icon name="arrow" size={16} />
          </Link>
        </div>
        <small>A wrong turn is just another kind of discovery.</small>
      </main>
      <footer className="bb-lost-footer">
        <Link to="/privacy">Privacy notice</Link>
        <span>A little curiosity goes a long way.</span>
      </footer>
    </div>
  );
}
