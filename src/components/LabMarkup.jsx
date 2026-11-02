import React from 'react';
import { assetUrl } from '../routing';
// The frame has an opaque origin and cannot read cookies, storage, or the parent.
export default function LabMarkup({ html, title = 'Isolated HTML lab preview' }) {
  return (
    <iframe
      title={title}
      sandbox="allow-scripts allow-modals"
      referrerPolicy="no-referrer"
      className="w-full border-0 min-h-16"
      src={assetUrl('api/labs/preview') + '?html=' + encodeURIComponent(html.slice(0, 12000))}
    />
  );
}
