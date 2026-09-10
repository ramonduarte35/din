/**
 * PWAInstallBanner.tsx
 *
 * Banner elegante que aparece quando o app pode ser instalado no dispositivo.
 * Integrado ao PWAContext para controle unificado com o menu da aplicação.
 * Também mostra status de sincronização offline quando há itens na fila.
 */

import React, { useEffect, useState } from 'react';
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useSyncQueue } from '../../hooks/useSyncQueue';
import { usePWA } from '../../contexts/PWAContext';

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isDismissed, dismissBanner, promptInstall } = usePWA();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { pendingCount, isSyncing, syncQueue } = useSyncQueue();

  // Monitora conectividade de rede
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

  return (
    <>
      {/* ── Banner de instalação automática do app ───────────────────────────── */}
      {isInstallable && !isDismissed && !isInstalled && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-96 z-50 animate-slide-up">
          <div className="bg-card border border-din-primary/40 rounded-2xl p-4 shadow-2xl shadow-black/40 flex items-start gap-3">
            {/* Ícone */}
            <div className="w-12 h-12 rounded-xl bg-card-secondary border border-border flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20 p-1">
              <img src="/meudino-mascot.png" alt="MeuDino" className="w-9 h-9 object-contain" />
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-din-text">Instalar MeuDino no Android</p>
              <p className="text-xs text-din-muted mt-0.5 leading-relaxed">
                Adicione à tela inicial para acesso offline e notificações.
              </p>

              {/* Botões */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={promptInstall}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-emerald-500/30 hover:from-emerald-600 hover:to-teal-600 transition-all min-h-[44px]"
                >
                  <Download className="w-3.5 h-3.5" />
                  Instalar Agora
                </button>
                <button
                  onClick={dismissBanner}
                  className="px-3 py-2 text-xs text-din-muted hover:text-din-text transition-colors min-h-[44px]"
                >
                  Agora não
                </button>
              </div>
            </div>

            {/* Fechar */}
            <button
              onClick={dismissBanner}
              aria-label="Dispensar aviso de instalação"
              className="p-1.5 text-din-muted hover:text-din-text transition-colors rounded-lg hover:bg-card-hover min-w-[32px] min-h-[32px] flex items-center justify-center"
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
