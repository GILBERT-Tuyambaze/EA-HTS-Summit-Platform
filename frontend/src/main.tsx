import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppErrorBoundary from './components/AppErrorBoundary';
import { PopupProvider } from './contexts/PopupContext';
import { ProgressProvider } from './contexts/ProgressContext';
import './styles/base.css';
import './styles/about-section.css';
import './styles/cta-banner.css';
import './styles/sdgs-section.css';
import './styles/footer.css';
import './styles/nav.css';
import './styles/command-center.css';
import './styles/hero.css';
import './styles/countdown.css';
import './styles/track-card.css';
import './styles/demo-card.css';
import './styles/partner-section.css';
import './styles/partner-inquiry.css';
import './styles/popup-message.css';
import './styles/progress-modal.css';
import './styles/register.css';
import './styles/register-success.css';
import './styles/feature-pages.css';
import './styles/app-state.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<main class="app-loading-screen"><section class="app-loading-card"><h1>EA-HTS Summit encountered an issue.</h1><p>Please reload the application to continue.</p></section></main>';
} else ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <PopupProvider>
        <ProgressProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ProgressProvider>
      </PopupProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
);
