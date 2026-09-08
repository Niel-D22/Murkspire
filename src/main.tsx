import { Buffer } from 'buffer';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';
import App from './App.tsx';

/* Buffer is required by @solana/web3.js. It is tiny, and keeping it here
   avoids a race where the polyfill lands after the dashboard chunk. */
window.Buffer = Buffer;
globalThis.Buffer = Buffer;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
