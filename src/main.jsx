import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { Router, configureBase } from './routing';

// Works at the domain root or the configured XAMPP subdirectory.
configureBase(new URL(import.meta.url).pathname.split(/\/(?:src|assets)\//)[0]);
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>
);
