import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { DailySalesProvider } from './contexts/DailySalesContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DailySalesProvider>
      <App />
    </DailySalesProvider>
  </StrictMode>
);
