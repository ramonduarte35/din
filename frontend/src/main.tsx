import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Registra o Service Worker PWA
// autoUpdate: atualiza silenciosamente em background quando há nova versão
registerSW({
  onNeedRefresh() {
    console.log('[Din PWA] Nova versão disponível. Recarregue para atualizar.');
  },
  onOfflineReady() {
    console.log('[Din PWA] App pronto para uso offline!');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
