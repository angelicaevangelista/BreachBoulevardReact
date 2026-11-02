import React from 'react';
import { Link } from '../../routing';
import { Brand, Icon, Mascot } from '../../components/Interface';
import useAccess from '../../hooks/useAccess';
export default function Access() {
  const access = useAccess();
  return (
    <div className="bb-ui bb-auth">
      <nav className="bb-public-header">
        <Brand />
        <Link to="/" className="bb-text-link">
          <Icon name="back" size={16} /> Back to home
        </Link>
      </nav>
      <main className="bb-auth-layout bb-access-layout">
        <section className="bb-auth-story">
          <span className="bb-eyebrow">
            <Icon name="key" size={15} /> ONE LITTLE KEY. A WORLD TO EXPLORE.
          </span>
          <h1>
            You’re almost
            <br />
            <span className="bb-orange">in.</span>
          </h1>
          <p>
            Your account is ready. Enter your course access code and let’s find your first
            discovery.
          </p>
          <div className="bb-auth-art">
            <Mascot />
            <span className="bb-art-sticker">
              <Icon name="shield" size={18} /> Curiosity looks good on you.
            </span>
          </div>
        </section>
        <section className="bb-auth-card">
          <span className="bb-stat-icon">
            <Icon name="key" />
          </span>
          <h1>Enter Access Code</h1>
          <p className="bb-auth-intro">
            A little key to your learning adventure. Use the code shared by your course
            administrator.
          </p>
          <form id="accessForm" className="bb-form" onSubmit={access.submit}>
            <div className="bb-field">
              <label htmlFor="accessCode">Course access code</label>
              <input
                id="accessCode"
                placeholder="Enter your access code"
                required
                value={access.code}
                onChange={(e) => access.setCode(e.target.value)}
                autoComplete="off"
              />
            </div>
            <button
              type="submit"
              className="bb-button bb-button-primary bb-button-wide"
              disabled={access.pending}
            >
              {access.pending ? 'Checking…' : 'Submit'}
              <Icon name="arrow" size={17} />
            </button>
          </form>
          {access.message && (
            <div id="message" role="alert" className="bb-notice">
              {access.message}
            </div>
          )}
          <p className="bb-auth-footnote">
            <Icon name="help" size={16} /> Don’t have a code? Ask your course administrator.
          </p>
          <Link className="bb-text-link" to="/privacy">
            Privacy notice
          </Link>
        </section>
      </main>
    </div>
  );
}
