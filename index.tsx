
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// اطمینان از لود شدن کامل DOM
const init = () => {
  const container = document.getElementById('root');

  if (container) {
    try {
      const root = createRoot(container);
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      console.log("App initialized with React 18.2.0");
    } catch (error) {
      console.error("Failed to render React app:", error);
    }
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
