import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing root element');

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Offline support. The service worker is generated after the build by
// scripts/build-sw.mjs and precaches every asset, including the lazy
// lesson chunks. In development there is no service worker.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Offline support is an extra, the app works without it.
    });
  });
}
