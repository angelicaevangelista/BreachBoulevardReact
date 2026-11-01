import React, { useState } from 'react';
import { Icon } from './Interface';
import { Link } from '../routing';

const steps = [
  {
    label: 'Pick a lab',
    icon: 'flask',
    title: 'Choose your first challenge.',
    description:
      'Sign in to explore the practice catalog and pick a guided lab. Each challenge gives you a safe, fictional scenario to investigate.',
    link: '/practice',
    linkText: 'Explore the labs',
  },
  {
    label: 'Follow the clues',
    icon: 'search',
    title: 'Experiment, with hints nearby.',
    description:
      'Try an action, read the feedback, and reveal a hint when you need one. Learn at your own pace, without risking real systems.',
    link: '/practice',
    linkText: 'Try a challenge',
  },
  {
    label: 'See your progress',
    icon: 'flag',
    title: 'Turn discoveries into progress.',
    description:
      'Complete a guided lab to see your progress. Completed labs are saved to your account, so you can come back for the next one.',
    link: '/access',
    linkText: 'Get started',
  },
];

export default function LearningJourney() {
  const [selected, setSelected] = useState(0);
  const step = steps[selected];

  return (
    <section className="bb-home-section bb-journey" aria-labelledby="journey-title">
      <span className="bb-eyebrow">
        <Icon name="spark" size={15} /> YOUR LEARNING PATH
      </span>
      <h2 id="journey-title">A little journey, a lot to discover.</h2>
      <p>Explore the model to see how Breach Boulevard works, one step at a time.</p>
      <div className="bb-journey-layout">
        <div className="bb-journey-scene" aria-hidden="true">
          <div className="bb-journey-orbit bb-journey-orbit-one" />
          <div className="bb-journey-orbit bb-journey-orbit-two" />
          <div className="bb-journey-world">
            <div className="bb-journey-base" />
            {steps.map((item, index) => (
              <div
                className={`bb-journey-block bb-journey-block-${index + 1}${selected === index ? ' is-active' : ''}`}
                key={item.label}
              >
                <span className="bb-journey-block-top">
                  <Icon name={item.icon} size={26} />
                </span>
                <span className="bb-journey-block-front">0{index + 1}</span>
                <span className="bb-journey-block-side" />
              </div>
            ))}
          </div>
          <span className="bb-journey-scene-caption">A SAFE PLACE TO EXPLORE</span>
        </div>
        <div className="bb-journey-content">
          <div className="bb-journey-steps" aria-label="Explore the learning journey">
            {steps.map((item, index) => (
              <button
                type="button"
                key={item.label}
                className={selected === index ? 'is-active' : ''}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <span>0{index + 1}</span> {item.label}
              </button>
            ))}
          </div>
          <div className="bb-journey-detail" aria-live="polite">
            <span className="bb-journey-detail-icon">
              <Icon name={step.icon} size={22} />
            </span>
            <span className="bb-journey-kicker">STEP 0{selected + 1} / 03</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <Link to={step.link} className="bb-journey-link">
              {step.linkText} <Icon name="arrow" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
