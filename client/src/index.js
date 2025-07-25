import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { EVTimerProvider } from './contexts/EVTimerContext';
import { SyncProvider } from './contexts/SyncContext';
// import { ChatNotificationProvider } from './contexts/ChatNotificationContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <EVTimerProvider>
            <SyncProvider>
              {/* <ChatNotificationProvider> */}
                <App />
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#1a1a1a',
                      color: '#ffffff',
                      border: '2px solid #4a4a4a',
                      fontFamily: 'Press Start 2P, monospace',
                      fontSize: '12px'
                    },
                  }}
                />
              {/* </ChatNotificationProvider> */}
            </SyncProvider>
          </EVTimerProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
); 