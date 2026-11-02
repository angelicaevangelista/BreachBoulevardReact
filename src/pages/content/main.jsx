import React, { useState, useCallback } from 'react';
import AppShell, { Icon, Mascot } from '../../components/Interface';
import VulnerabilityModal, { courseExercises } from '../../components/VulnerabilityModal';
const descriptions = {
  'SQL Injection': 'Follow untrusted input into a query and discover why parameters matter.',
  'Cross-Site Scripting': 'Explore unsafe rendering and learn how to keep data from becoming code.',
  'Broken Authentication': 'Investigate weak credentials and build better sign-in habits.',
  'Insecure Direct Object References':
    'Discover why knowing an ID should never grant access to a record.',
  'Sensitive Data Exposure':
    'Spot the secrets hiding in plain sight and learn to keep them private.',
  'Path Traversal': 'See how an innocent-looking file path can cross an important boundary.',
};
export default function Courses() {
  const [course, setCourse] = useState(null);
  const close = useCallback(() => setCourse(null), []);
  return (
    <AppShell active="courses" title="Courses" eyebrow="Make sense of the how and why">
      <div className="bb-page-heading">
        <div>
          <span className="bb-eyebrow">
            <Icon name="book" size={15} /> FOLLOW YOUR CURIOSITY
          </span>
          <h1>
            A world of <span className="bb-course-heading-accent">little discoveries</span>
            <span className="bb-orange">.</span>
          </h1>
          <p>Explore a topic, choose an exercise, and turn a new idea into a skill you can use.</p>
        </div>
        <span className="bb-tag bb-tag-orange">6 security topics</span>
      </div>
      <section className="bb-lab-grid" aria-label="Security courses">
        {Object.keys(courseExercises).map((name, index) => (
          <article className="bb-course-card" key={name}>
            <span
              className={`bb-lab-icon ${index % 3 === 1 ? 'is-purple' : index % 3 === 2 ? 'is-mint' : ''}`}
            >
              <Icon name={['terminal', 'code', 'key', 'eye', 'shield', 'book'][index]} size={24} />
            </span>
            <h2>{name}</h2>
            <p>{descriptions[name]}</p>
            <span className="bb-course-count">
              {courseExercises[name].length}{' '}
              {courseExercises[name].length === 1 ? 'exercise' : 'exercises'} to explore
            </span>
            <button className="bb-button bb-button-secondary" onClick={() => setCourse(name)}>
              View Vulnerabilities
              <Icon name="arrow" size={16} />
            </button>
          </article>
        ))}
      </section>
      <div className="bb-catalog-banner">
        <div>
          <h3>A safe place to be curious.</h3>
          <p>
            These exercises simulate vulnerabilities for learning. Practice only in environments
            where you have permission.
          </p>
        </div>
        <Mascot compact />
      </div>
      <VulnerabilityModal course={course} onClose={close} />
    </AppShell>
  );
}
