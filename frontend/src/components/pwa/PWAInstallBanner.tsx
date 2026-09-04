/**
 * PWAInstallBanner.tsx
 *
 * Banner elegante que aparece quando o app pode ser instalado no dispositivo.
 * Captura o evento beforeinstallprompt do navegador (Android Chrome/Edge).
 * Também mostra status de sincronização offline quando há itens na fila.
 */

import React, { useEffect, useState } from 'react';
import { Download, X, Wifi, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { useSyncQueue } from '../../hooks/useSyncQueue';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('pwa-install-dismissed') === 'true'
  );

  const { pendingCount, isSyncing, syncQueue } = useSyncQueue();

  // Captura o evento de instalação nativo do Chrome/Android
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed) setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [dismissed]);

  // Monitora conectividade
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  return (
    <>
      {/* ── Banner de instalação do app ─────────────────────────────────────── */}
      {showInstallBanner && !dismissed && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-slide-up">
          <div className="bg-card border border-din-primary/40 rounded-2xl p-4 shadow-2xl shadow-black/40 flex items-start gap-3">
            {/* Ícone */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <Smartphone className="w-6 h-6 text-slate-950" />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-din-text">Instalar Din no Android</p>
              <p className="text-xs text-din-muted mt-0.5 leading-relaxed">
                Adicione à tela inicial para acesso offline e notificações.
              </p>

              {/* Botões */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all min-h-[36px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Instalar Agora
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 text-xs text-din-muted hover:text-din-text transition-colors min-h-[36px]"
                >
                  Agora não
                </button>
              </div>
            </div>

            {/* Fechar */}
            <button
              onClick={handleDismiss}
              className="p-1.5 text-din-muted hover:text-din-text transition-colors rounded-lg hover:bg-card-hover"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Indicador de status offline / sincronizando ──────────────────────── */}
      {(!isOnline || pendingCount > 0 || isSyncing) && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-1.5 px-4 text-xs font-semibold transition-all ${
            !isOnline
              ? 'bg-amber-500/90 text-amber-950 backdrop-blur-sm'
              : isSyncing
              ? 'bg-emerald-500/90 text-white backdrop-blur-sm'
              : 'bg-blue-500/90 text-white backdrop-blur-sm'
          }`}
        >
          {!isOnline ? (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Modo offline — dados salvos localmente</span>
              {pendingCount > 0 && (
                <span className="bg-amber-900/30 px-1.5 rounded-full">
                  {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
                </span>
              )}
            </>
          ) : isSyncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Sincronizando dados offline...</span>
            </>
          ) : pendingCount > 0 ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Conectado — {pendingCount} operaç{pendingCount > 1 ? 'ões' : 'ão'} para sincronizar</span>
              <button
                onClick={syncQueue}
                className="underline font-bold ml-1"
              >
                Sincronizar agora
              </button>
            </>
          ) : null}
        </div>
      )}
    </>
  );
}
