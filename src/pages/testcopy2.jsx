import React, { useEffect, useRef, useState } from 'react';
import { Link } from '../routing';
import { Brand, Icon, Mascot } from '../components/Interface';
import QuizTerminal from '../components/QuizTerminal';
import FaqItem from '../components/FaqItem';
import LearningJourney from '../components/LearningJourney';
import LabWalkthrough from '../components/LabWalkthrough';
import SqlPlayground from '../components/SqlPlayground';
import ThemeToggle from '../components/ThemeToggle';
export default function Home() {
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const home = useRef(null);
  useEffect(() => {
    if (
      !window.IntersectionObserver ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('bb-reveal-wait');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    home.current.querySelectorAll('.bb-reveal').forEach((element) => {
      if (element.getBoundingClientRect().top >= window.innerHeight) {
        element.classList.add('bb-reveal-wait');
        observer.observe(element);
      }
    });
    return () => observer.disconnect();
  }, []);
  return (
    <div className="bb-ui bb-home" ref={home}>
      <nav className="bb-public-header">
        <Brand />
        <div className="bb-home-links">
          <ThemeToggle />
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
              <Icon name="flask" size={15} />6 guided labs + 15 CTFs
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
      <section
        className="bb-home-section bb-honey-intro bb-reveal"
        aria-labelledby="meet-honey-title"
      >
        <div className="bb-honey-intro-note">
          <span className="bb-eyebrow">
            <Icon name="spark" size={15} /> A LITTLE AI. A LOT OF HEART.
          </span>
          <h2 id="meet-honey-title">
            Meet Honey.
            <br />
            <span>Your AI companion on the Boulevard.</span>
          </h2>
          <p>
            A friendly bee for curious minds. Honey helps you follow lab clues, explains your next
            step, and cheers for your little wins.
          </p>
          <div className="bb-honey-intro-tags">
            <span>
              <Icon name="help" size={15} /> Hints at your pace
            </span>
            <span>
              <Icon name="heart" size={15} /> A hello and a little cheer
            </span>
            <span>
              <Icon name="flag" size={15} /> Your next discovery
            </span>
          </div>
          <small>
            Honey follows prepared conversations and guided hints, so her help stays focused on your
            learning.
          </small>
        </div>
        <div className="bb-honey-intro-chat">
          <span className="bb-honey-intro-label">
            <Icon name="spark" size={14} /> A HELLO FROM HONEY
          </span>
          <p className="bb-honey-intro-user">Hi Honey, what’s your favorite place?</p>
          <p className="bb-honey-intro-answer">
            The Streak Garden! Tiny smiling flowers, sweet honey jars, and a reminder that little
            steps matter.<span>— Honey, your little Boulevard guide</span>
          </p>
          <Link to="/access" className="bb-button bb-button-soft">
            Meet her inside
            <Icon name="arrow" size={15} />
          </Link>
        </div>
      </section>
      <section className="bb-home-section bb-reveal">
        <span className="bb-eyebrow">SMALL STEPS. REAL SKILLS.</span>
        <h2>Learning feels better here.</h2>
        <p>A little structure, a little play, and plenty of room to figure things out.</p>
        <div className="bb-home-features">
          {[
            [
              'flask',
              'Try it. Break it. Get it.',
              'Explore 21 fictional websites: six guided labs and 15 capture-the-flag challenges.',
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
      <LearningJourney />
      <LabWalkthrough />
      <section className="bb-home-section bb-reveal" id="playground">
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
            <p className="bb-admin-note">
              Type help to see every command — try ls, cat, whoami, or quiz. No experience needed.
            </p>
          </section>
          <SqlPlayground />
        </div>
      </section>
      <section className="bb-home-section bb-reveal">
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
