import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Limpeza de caches antigos da API que causavam dados desatualizados (stale cache)
if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then((cacheNames) => {
    cacheNames.forEach((cacheName) => {
      if (
        cacheName.includes('api-lists') ||
        cacheName.includes('api-summary') ||
        cacheName.includes('din-api')
      ) {
        caches.delete(cacheName).then(() => {
          console.log(`[Meu Dino PWA] Cache obsoleto da API purgado com sucesso: ${cacheName}`);
        });
      }
    });
  }).catch(() => {});
}

// Registra o Service Worker PWA
// autoUpdate: atualiza silenciosamente em background quando há nova versão
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[Meu Dino PWA] Nova versão disponível. Recarregando...');
  },
  onOfflineReady() {
    console.log('[Meu Dino PWA] App pronto para uso offline!');
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
