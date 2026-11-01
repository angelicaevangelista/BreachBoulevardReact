import React from 'react';
import { Mascot } from './Interface';
export default function HoneyBee({
  size = 120,
  label = 'Honey, your friendly helper bee',
  className = '',
}) {
  return (
    <Mascot
      compact
      className={className}
      style={{ width: size, height: size }}
      aria-label={label}
    />
  );
}
