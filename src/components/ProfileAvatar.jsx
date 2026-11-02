import React from 'react';
import { assetUrl } from '../routing';
import { profileAvatar } from '../data/avatars';
export default function ProfileAvatar({ id, className = '', size = 44, decorative = false }) {
  const avatar = profileAvatar(id);
  return (
    <img
      className={`bb-profile-avatar ${className}`}
      src={`${assetUrl(`avatars/${avatar.id}.svg`)}?v=2`}
      width={size}
      height={size}
      alt={decorative ? '' : avatar.name}
    />
  );
}
