import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAContextType {
  deferredPrompt: BeforeInstallPromptEvent | null;
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isDismissed: boolean;
  isInstallModalOpen: boolean;
  openInstallModal: () => void;
  closeInstallModal: () => void;
  promptInstall: () => Promise<void>;
  dismissBanner: () => void;
  resetDismissed: () => void;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return localStorage.getItem('pwa-install-dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const [isInstalled, setIsInstalled] = useState(() => {
    try {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
    } catch {
      return false;
    }
  });

  const [isIOS, setIsIOS] = useState(() => {
    try {
      const ua = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(ua);
    } catch {
      return false;
    }
  });

  // Monitora alterações de display-mode (ex: usuário acabou de instalar)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    try {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch {
      // Fallback para navegadores legados
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Captura o evento nativo beforeinstallprompt do Chrome/Android/Edge
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Evento disparado quando o app foi instalado com sucesso
    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    };

    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const openInstallModal = () => setIsInstallModalOpen(true);
  const closeInstallModal = () => setIsInstallModalOpen(false);

  const promptInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          setIsInstallModalOpen(false);
        }
      } catch (err) {
        console.error('[PWA] Erro ao abrir prompt nativo:', err);
        // Se falhar, abre o modal com o guia visual
        setIsInstallModalOpen(true);
      }
    } else {
      // Se não há prompt nativo disponível (iOS, já instalado ou cooldown), abre guia passo a passo
      setIsInstallModalOpen(true);
    }
  };

  const dismissBanner = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('pwa-install-dismissed', 'true');
    } catch {}
  };

  const resetDismissed = () => {
    setIsDismissed(false);
    try {
      localStorage.removeItem('pwa-install-dismissed');
    } catch {}
  };

  return (
    <PWAContext.Provider
      value={{
        deferredPrompt,
        isInstallable: Boolean(deferredPrompt),
        isInstalled,
        isIOS,
        isDismissed,
        isInstallModalOpen,
        openInstallModal,
        closeInstallModal,
        promptInstall,
        dismissBanner,
        resetDismissed,
      }}
    >
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA deve ser utilizado dentro de um PWAProvider');
  }
  return context;
}
