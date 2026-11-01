import React, { useState } from 'react';
import { Link } from '../routing';
import { Brand, Icon, Mascot } from '../components/Interface';
import useSqlDemo from '../hooks/useSqlDemo';
import QuizTerminal from '../components/QuizTerminal';
import FaqItem from '../components/FaqItem';
export default function Home() {
  const sql = useSqlDemo();
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  return (
    <div className="bb-ui bb-home">
      <nav className="bb-public-header">
        <Brand />
        <div className="bb-home-links">
          <Link to="/about">About</Link>
          <Link to="/practice">Labs</Link>
          <Link to="/access" className="bb-button bb-button-primary">
            Get Started
            <Icon name="arrow" size={16} />
          </Link>
        </div>
      </nav>
      <header className="bb-home-hero">
        <div>
          <span className="bb-eyebrow">
            <Icon name="spark" size={15} /> FOR THE CURIOUS MINDS
          </span>
          <h1>
            A little curious.
            <br />A lot more
            <br />
            <span className="bb-orange">cyber smart.</span>
          </h1>
          <p>
            Meet your friendly corner of cybersecurity. Explore hands-on labs, follow the clues, and
            turn “what if?” into “I get it.”
          </p>
          <div className="bb-hero-actions">
            <Link to="/access" className="bb-button bb-button-primary">
              Let’s get started
              <Icon name="arrow" size={17} />
            </Link>
            <Link to="/practice" className="bb-button bb-button-secondary">
              Explore the labs
            </Link>
          </div>
          <div className="bb-home-bits">
            <span>
              <Icon name="flask" size={15} />6 guided labs
            </span>
            <span>
              <Icon name="heart" size={15} />
              Beginner friendly
            </span>
            <span>
              <Icon name="shield" size={15} />
              Safe to explore
            </span>
          </div>
        </div>
        <div className="bb-auth-art">
          <Mascot />
          <div className="bb-art-terminal">
            <div className="bb-code-dots">
              <i />
              <i />
              <i />
            </div>
            <code>
              <span>$ hello, curious human</span>
              <br />
              Initializing your next discovery…
              <br />
              <span className="bb-mint">✓ You’ve got this.</span>
            </code>
          </div>
          <span className="bb-art-sticker">
            <Icon name="flag" size={18} /> First flag? Coming right up.
          </span>
        </div>
      </header>
      <section className="bb-home-section">
        <span className="bb-eyebrow">SMALL STEPS. REAL SKILLS.</span>
        <h2>Learning feels better here.</h2>
        <p>A little structure, a little play, and plenty of room to figure things out.</p>
        <div className="bb-home-features">
          {[
            [
              'flask',
              'Try it. Break it. Get it.',
              'Explore six guided security challenges with fictional data and real lessons.',
            ],
            [
              'help',
              'A nudge when you need it.',
              'Reveal hints at your own pace. Every attempt is another clue.',
            ],
            [
              'flag',
              'See how far you’ve come.',
              'Keep your completed labs in your account and pick up your next challenge.',
            ],
          ].map(([icon, title, copy]) => (
            <article className="bb-home-feature" key={title}>
              <span className="bb-stat-icon">
                <Icon name={icon} />
              </span>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bb-home-section" id="playground">
        <span className="bb-eyebrow">
          <Icon name="terminal" size={15} /> A LITTLE TASTE OF THE ADVENTURE
        </span>
        <h2>Go on. Poke around.</h2>
        <p>Try the terminal quiz or a tiny SQL demonstration before starting the full labs.</p>
        <div className="bb-playground-grid">
          <section className="bb-panel">
            <div className="bb-panel-heading">
              <h3>Curiosity console</h3>
              <span className="bb-tag">Try “help”</span>
            </div>
            <QuizTerminal
              id="terminal"
              welcome={<p>Welcome, curious human. Type help to get started.</p>}
            />
            <p className="bb-admin-note">Type help, about, clear, or quiz. No experience needed.</p>
          </section>
          <section className="bb-panel">
            <div className="bb-panel-heading">
              <h3>A sneaky little login</h3>
              <span className="bb-tag bb-tag-orange">SQL demo</span>
            </div>
            <p className="bb-muted">What happens when an input becomes part of a query?</p>
            <form
              className="bb-form"
              onSubmit={(event) => {
                event.preventDefault();
                sql.checkLogin();
              }}
            >
              <div className="bb-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  ref={sql.usernameRef}
                  value={sql.username}
                  onChange={(e) => sql.setUsername(e.target.value)}
                  autoComplete="off"
                  placeholder="Try a username…"
                />
              </div>
              <div className="bb-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={sql.password}
                  onChange={(e) => sql.setPassword(e.target.value)}
                  autoComplete="off"
                  placeholder="And a password"
                />
              </div>
              <button className="bb-button bb-button-primary" type="submit">
                Login
              </button>
            </form>
            <div id="output" role="status">
              {sql.output}
            </div>
            <div id="info">{sql.info}</div>
          </section>
        </div>
      </section>
      <section className="bb-home-section">
        <span className="bb-eyebrow">A FEW LITTLE ANSWERS</span>
        <h2>Curious about the details?</h2>
        <div className="bb-home-faq">
          {[
            [
              'Do I need experience?',
              'No. Start with a beginner lab and use the hints whenever you need them. Curiosity is a great first step.',
            ],
            [
              'Are these real attacks?',
              'The guided practice labs simulate vulnerable behavior using fictional data. They’re a controlled place to learn how weaknesses work and how to fix them.',
            ],
            [
              'Will my progress be saved?',
              'Yes. When you sign in, completed guided labs are saved to your account so you can return to your learning path.',
            ],
            [
              'How do I get access?',
              'Choose Get Started and sign in with Google or a confirmed email account. Then enter the course access code shared by your administrator.',
            ],
          ].map(([question, answer]) => (
            <FaqItem
              key={question}
              question={question}
              buttonClass="bb-faq-button"
              iconClass="fa-plus"
              answerClass="bb-faq-answer"
            >
              {answer}
            </FaqItem>
          ))}
        </div>
      </section>
      <footer className="bb-home-bottom">
        <Brand />
        <span>A little practice. A safer tomorrow.</span>
        <div>
          <Link to="/privacy">Privacy notice</Link>
          <Link to="/about">About</Link>
          <Link to="/access">Get Started</Link>
        </div>
      </footer>
      {disclaimerVisible && (
        <aside id="disclaimer" className="bb-disclaimer">
          <Icon name="shield" size={24} />
          <p>
            <strong>A safe place to learn.</strong> These simulations are for education. Practice
            only on systems where you have permission.
          </p>
          <button
            id="acceptDisclaimer"
            className="bb-button bb-button-soft"
            onClick={() => setDisclaimerVisible(false)}
          >
            I Understand
          </button>
        </aside>
      )}
    </div>
  );
}
