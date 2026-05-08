import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1c1917',
              color: '#fafaf9',
              fontFamily: 'Geist, sans-serif',
              fontSize: '14px',
              borderRadius: '4px',
              border: '1px solid #44403c',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
