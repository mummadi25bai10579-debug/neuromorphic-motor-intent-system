import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress benign WebSocket/Vite HMR connection errors and unhandled rejections
if (typeof window !== "undefined") {
  const ignorePatterns = ["websocket", "vite", "hmr", "failed to connect"];
  
  const shouldIgnore = (message: string) => {
    const msgLower = (message || "").toLowerCase();
    return ignorePatterns.some(pattern => msgLower.includes(pattern));
  };

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    if (reason) {
      const msg = reason.message || String(reason);
      if (shouldIgnore(msg)) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        console.debug("NeuroLinker: Muted benign connection rejection:", msg);
      }
    }
  }, true);

  window.addEventListener("error", (event) => {
    const msg = event.message || "";
    if (shouldIgnore(msg)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      console.debug("NeuroLinker: Muted benign connection error:", msg);
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
