import React from 'react';
import { Link } from '../routing';
import { Icon, Mascot } from './Interface';

function Shop({ x, y, name, tone }) {
  return (
    <g transform={`translate(${x} ${y})`} className={`boulevard-shop ${tone}`}>
      <path className="shop-side" d="m88 22 32-20v90l-32 20Z" />
      <path className="shop-front" d="m0 0 88 22v90L0 90Z" />
      <path className="shop-roof" d="m-5-2 37-23 93 23-37 26Z" />
      <path className="shop-trim" d="m0 1 88 22v8L0 9Z" />
      <g transform="translate(10 38) skewY(14)">
        <rect width="68" height="17" rx="3" className="shop-sign" />
        <text x="34" y="11" textAnchor="middle">
          {name}
        </text>
        <rect x="2" y="26" width="24" height="26" rx="3" className="shop-window" />
        <path d="M14 26v26M2 39h24" className="shop-window-frame" />
        <rect x="39" y="23" width="23" height="45" rx="8" className="shop-door" />
        <circle cx="55" cy="48" r="1.7" fill="#ffe0a0" />
      </g>
      <path className="shop-window" d="m98 34 12-7v22l-12 7Z" />
    </g>
  );
}

export default function BoulevardWelcome() {
  return (
    <div className="bb-auth-art boulevard-scene">
      <div className="boulevard-scene-caption">
        <span className="boulevard-live-dot" /> A LITTLE WORLD OF WHAT IF?
      </div>
      <svg
        className="boulevard-town"
        viewBox="0 0 520 420"
        role="group"
        aria-label="Explore the Breach Boulevard neighborhood"
      >
        <ellipse cx="266" cy="344" rx="215" ry="42" className="boulevard-ground-shadow" />
        <path d="m22 238 252-133 230 126v17L252 390 22 255Z" className="boulevard-island-edge" />
        <path d="m22 238 252-133 230 126-252 142Z" className="boulevard-island" />
        <path
          d="m67 259 166-94 58 31-167 95Zm91 51 166-94 147 80-58 32-89-48-108 63Z"
          className="boulevard-road"
        />
        <path d="m93 274 169-94m-77 147 139-79 115 63" className="boulevard-road-line" />
        <Link to="/practice" aria-label="Visit the Lab Arcade">
          <Shop x={64} y={155} name="LAB ARCADE" tone="sage" />
        </Link>
        <Link to="/missions" aria-label="Visit Case File Corner">
          <Shop x={222} y={91} name="CASE FILES" tone="peach" />
        </Link>
        <a href="#meet-honey" aria-label="Meet Honey at Honey HQ">
          <Shop x={366} y={169} name="HONEY HQ" tone="lavender" />
        </a>
        <g className="boulevard-lamp" transform="translate(36 224)">
          <path d="M0 0v-78q0-10 10-10h10" />
          <path d="M13-88h16l-4 10H17Z" />
          <ellipse cx="21" cy="-73" rx="20" ry="11" />
        </g>
        <g transform="translate(248 313)">
          <ellipse rx="17" ry="7" fill="#243d3120" />
          <path d="M0-5v-30" stroke="#8d6949" strokeWidth="5" />
          <circle cy="-43" r="20" className="boulevard-tree" />
          <circle cx="-10" cy="-34" r="13" className="boulevard-tree" />
          <path
            d="M-8-48q5-6 11-5"
            stroke="#e5edbb"
            strokeWidth="3"
            strokeLinecap="round"
            opacity=".6"
          />
        </g>
        <g transform="translate(174 346)">
          <path d="M0 0v-24m0 1 20 4-20 9" fill="#efac68" stroke="#ffe0a5" strokeWidth="2" />
          <ellipse cy="2" rx="7" ry="3" fill="#243d3120" />
        </g>
        <path
          d="m137 319 15 8m-23-4 15 8m200-35 15 8m-23-4 15 8"
          stroke="#edcf9b"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <div className="boulevard-street-sign">
        <span>BREACH</span>
        <strong>
          BOULEVARD <Icon name="arrow" size={17} />
        </strong>
        <small>Curiosity lives here.</small>
      </div>
      <Mascot />
      <div className="bb-art-terminal boulevard-welcome-note">
        <Icon name="heart" size={15} />
        <span>
          “I saved you a spot.” <b>— Honey</b>
        </span>
      </div>
      <Link to="/missions" className="boulevard-case-tag">
        <Icon name="search" size={15} /> A mystery is waiting <Icon name="arrow" size={13} />
      </Link>
    </div>
  );
}
