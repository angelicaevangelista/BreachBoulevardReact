import React, { useId } from 'react';

export default function HoneyBee({ size = 120, label = 'Honey the bee helper', className = '' }) {
  const id = useId().replace(/:/g, '');
  const bodyId = `${id}-body`;
  const headId = `${id}-head`;
  const wingId = `${id}-wing`;
  const clipId = `${id}-clip`;

  return (
    <svg
      className={`bb-honey ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={bodyId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffd38f" />
          <stop offset="45%" stopColor="#ff9a3c" />
          <stop offset="100%" stopColor="#b24a14" />
        </radialGradient>
        <radialGradient id={headId} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#3f5c72" />
          <stop offset="100%" stopColor="#0c1826" />
        </radialGradient>
        <linearGradient id={wingId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f2fdff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#8fd8f0" stopOpacity="0.35" />
        </linearGradient>
        <clipPath id={clipId}>
          <ellipse cx="100" cy="122" rx="60" ry="54" />
        </clipPath>
      </defs>

      <ellipse className="bb-honey-shadow" cx="100" cy="184" rx="50" ry="9" />

      <g className="bb-honey-sway">
        <g className="bb-honey-wing bb-honey-wing-left">
          <ellipse
            cx="58"
            cy="82"
            rx="28"
            ry="38"
            transform="rotate(-20 58 82)"
            fill={`url(#${wingId})`}
            stroke="#c9f1ff"
            strokeOpacity="0.7"
          />
        </g>
        <g className="bb-honey-wing bb-honey-wing-right">
          <ellipse
            cx="142"
            cy="82"
            rx="28"
            ry="38"
            transform="rotate(20 142 82)"
            fill={`url(#${wingId})`}
            stroke="#c9f1ff"
            strokeOpacity="0.7"
          />
        </g>

        <path d="M96 56 Q92 38 84 30" stroke="#2b1a10" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle className="bb-honey-antenna-tip" cx="83" cy="28" r="8" fill="#ffe27a" />

        <path d="M44 116 Q30 128 36 146" stroke="#7f95a6" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M156 116 Q170 128 164 146" stroke="#7f95a6" strokeWidth="6" fill="none" strokeLinecap="round" />

        <ellipse cx="100" cy="122" rx="60" ry="54" fill={`url(#${bodyId})`} />
        <g clipPath={`url(#${clipId})`}>
          <rect x="30" y="104" width="140" height="13" fill="#2e1a0e" opacity="0.85" />
          <rect x="30" y="134" width="140" height="13" fill="#2e1a0e" opacity="0.85" />
          <ellipse cx="72" cy="100" rx="26" ry="13" fill="#fff4dc" opacity="0.35" />
        </g>
        <path d="M96 170 L100 186 L104 170 Z" fill="#2e1a0e" />

        <rect x="52" y="44" width="96" height="72" rx="26" fill={`url(#${headId})`} stroke="#7fe8d0" strokeOpacity="0.5" strokeWidth="2" />
        <rect x="62" y="56" width="76" height="46" rx="16" fill="#0a2430" />
        <circle cx="60" cy="52" r="2.5" fill="#9fb4c4" />
        <circle cx="140" cy="52" r="2.5" fill="#9fb4c4" />
        <circle cx="60" cy="108" r="2.5" fill="#9fb4c4" />
        <circle cx="140" cy="108" r="2.5" fill="#9fb4c4" />

        <g className="bb-honey-eyes">
          <ellipse cx="83" cy="78" rx="8" ry="10" fill="#7ff5d6" />
          <ellipse cx="117" cy="78" rx="8" ry="10" fill="#7ff5d6" />
          <circle cx="80" cy="74" r="2.5" fill="#f4fffb" />
          <circle cx="114" cy="74" r="2.5" fill="#f4fffb" />
        </g>
        <circle cx="70" cy="96" r="6" fill="#ff8a65" opacity="0.6" />
        <circle cx="130" cy="96" r="6" fill="#ff8a65" opacity="0.6" />
        <path d="M92 92 Q100 98 108 92" stroke="#7ff5d6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}
