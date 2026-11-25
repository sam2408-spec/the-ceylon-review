// Share links look like /share/<article-id>; turn them into the site's normal deep link
// before the app starts, without reloading the page.
try {
  const shared = window.location.pathname.match(/^\/share\/([A-Za-z0-9_-]{1,120})\/?$/);
  if (shared) window.history.replaceState(null, '', '/?article=' + encodeURIComponent(shared[1]));
} catch { /* ignore */ }

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
