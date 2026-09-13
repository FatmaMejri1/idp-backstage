import '@backstage/cli/asset-types';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@backstage/ui/css/styles.css';
import { setupCryptoPolyfill } from './crypto-polyfill';

// Setup crypto polyfill before app initialization
setupCryptoPolyfill();

// Automatically recover from stale chunks when dev server restarts
window.addEventListener('error', event => {
  if (
    event.message?.includes('ChunkLoadError') ||
    /Loading chunk .* failed/.test(event.message || '')
  ) {
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(App.createRoot());
