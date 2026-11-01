import React, { useId } from 'react';
export default function HoneyBee({
  size = 120,
  label = 'Honey the friendly helper bee',
  className = '',
}) {
  const id = useId().replace(/:/g, '');
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={`bb-honey ${className}`}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id={id}>
          <stop stopColor="#ffdf99" />
          <stop offset="1" stopColor="#ffb347" />
        </radialGradient>
        <linearGradient id={`${id}w`} x2="0" y2="1">
          <stop stopColor="#f6fcff" />
          <stop offset="1" stopColor="#c7e5f1" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="181" rx="40" ry="7" fill="#050d18" opacity=".18" />
      <g className="bb-honey-sway">
        <ellipse
          cx="52"
          cy="96"
          rx="22"
          ry="33"
          transform="rotate(-35 52 96)"
          fill={`url(#${id}w)`}
        />
        <ellipse
          cx="148"
          cy="96"
          rx="22"
          ry="33"
          transform="rotate(35 148 96)"
          fill={`url(#${id}w)`}
        />
        <ellipse cx="100" cy="130" rx="49" ry="44" fill="#ed9c38" />
        <path
          d="M54 135q46 18 92 0 M65 158q35 12 70 0"
          stroke="#334052"
          strokeWidth="9"
          fill="none"
        />
        <path
          d="M81 59Q72 31 62 34 M119 59q9-28 19-25"
          stroke="#334052"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="62" cy="32" r="7" fill="#ffca68" />
        <circle cx="138" cy="32" r="7" fill="#ffca68" />
        <ellipse cx="100" cy="90" rx="55" ry="47" fill={`url(#${id})`} />
        <g className="bb-honey-eyes">
          <ellipse cx="82" cy="87" rx="7" ry="10" fill="#293447" />
          <ellipse cx="118" cy="87" rx="7" ry="10" fill="#293447" />
          <circle cx="80" cy="83" r="2.5" fill="#fff6dd" />
          <circle cx="116" cy="83" r="2.5" fill="#fff6dd" />
        </g>
        <ellipse cx="66" cy="105" rx="9" ry="5" fill="#ef9a9c" />
        <ellipse cx="134" cy="105" rx="9" ry="5" fill="#ef9a9c" />
        <path
          d="M91 106q9 12 18 0"
          fill="none"
          stroke="#293447"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <ellipse cx="49" cy="131" rx="10" ry="14" transform="rotate(-25 49 131)" fill="#ffbf60" />
        <ellipse cx="151" cy="131" rx="10" ry="14" transform="rotate(25 151 131)" fill="#ffbf60" />
        <ellipse cx="79" cy="172" rx="14" ry="8" fill="#efaa4c" />
        <ellipse cx="121" cy="172" rx="14" ry="8" fill="#efaa4c" />
        <path d="m93 139 7-3 7 3v7q-2 5-7 8-5-3-7-8z" fill="#fff5db" />
      </g>
    </svg>
  );
}
