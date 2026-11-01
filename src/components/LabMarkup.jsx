import React from 'react';
// The frame has an opaque origin and cannot read cookies, storage, or the parent.
export default function LabMarkup({ html, title = 'Isolated HTML lab preview' }) {
  return (
    <iframe
      title={title}
      sandbox="allow-scripts allow-modals"
      referrerPolicy="no-referrer"
      className="w-full border-0 min-h-16"
      srcDoc={`<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; form-action 'none'; base-uri 'none'"><style>body{margin:0;color:#d1d5db;background:#1f2937;font:16px/1.5 Arial,sans-serif;overflow-wrap:anywhere}h3{color:#f97316;font-size:18px}</style></head><body>${html}</body></html>`}
    />
  );
}
