import React from 'react';
import { Link } from '../routing';
import { Icon } from './Interface';
import { missionCases } from '../data/missions';
import useMissionDesk from '../hooks/useMissionDesk';
export default function MissionTeaser() {
  const desk = useMissionDesk();
  const closed = desk.cases.filter((c) => c.state.solved.length === 3).length;
  const active =
    missionCases.find(
      (c) => (desk.cases.find((r) => r.caseId === c.id)?.state.solved.length || 0) < 3
    ) || missionCases[0];
  return (
    <section className="bb-mission-teaser">
      <div className="mission-teaser-art" aria-hidden="true">
        <span>CASE FILE</span>
        <strong>01</strong>
        <i>✦</i>
        <div>3 connected trails</div>
      </div>
      <div>
        <span className="bb-eyebrow">
          <Icon name="search" size={14} /> THE BOULEVARD CASE DESK
        </span>
        <h2>Your next discovery has a story.</h2>
        <p>
          A buzzing phone. A curious case file. Follow the clues across connected labs and file your
          own detective report.
        </p>
        <small>
          {desk.loading
            ? 'Opening your case drawer…'
            : desk.error
              ? 'Your case desk is ready to explore.'
              : `${closed} of 3 cases closed · ${active.title}`}
        </small>
      </div>
      <Link to={`/missions?case=${active.id}`} className="bb-button bb-button-primary">
        {closed === 3 ? 'Revisit the case desk' : 'Open my case desk'}
        <Icon name="arrow" size={16} />
      </Link>
    </section>
  );
}
