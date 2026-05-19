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
              background: '#1A1A2E',
              color: '#E8E8FF',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '6px',
              border: '1px solid #2A2A3E',
              boxShadow: '0 0 24px rgba(127, 0, 255, 0.15)',
            },
            success: {
              iconTheme: {
                primary: '#7F00FF',
                secondary: '#E8E8FF',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF2400',
                secondary: '#E8E8FF',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
