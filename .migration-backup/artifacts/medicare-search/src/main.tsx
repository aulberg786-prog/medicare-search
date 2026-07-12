import { createRoot } from 'react-dom/client';
import { setBaseUrl } from '@workspace/api-client-react';

import App from './App';
import { ErrorBoundary } from './components/error-boundary';

import './index.css';

// When VITE_API_BASE_URL is set (e.g. on Vercel), point all API calls there.
// On Replit the frontend and API server share the same origin so no base URL needed.
const apiBase = import.meta.env.VITE_API_BASE_URL;
if (apiBase) {
  setBaseUrl(apiBase);
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
