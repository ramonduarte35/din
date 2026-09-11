/**
 * @file useConsent.ts
 * @description Hook de gerenciamento de consentimento LGPD.
 *
 * Responsabilidades:
 * - Persistir preferências localmente (localStorage) e no backend (quando autenticado)
 * - Controlar injeção de scripts de terceiros (analytics, marketing) via data-consent-type
 * - Limpar cookies de terceiros quando consentimento for recusado/revogado
 *
 * Estratégia de bloqueio de scripts:
 *  No index.html, scripts de terceiros usam type="text/plain" + data-src="..."
 *  Este hook ativa/desativa dinamicamente substituindo o tipo e clonando os elementos.
 */

import { useState, useEffect, useCallback, useContext, createContext, type ReactNode } from 'react';
import { getConsents, recordConsent, type OptInTypes, type ActiveTerm } from '../api/privacy';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

export type ConsentStatus = 'pending' | 'accepted' | 'partial' | 'declined';

export interface ConsentState {
  status:      ConsentStatus;
  preferences: OptInTypes;
  version:     string | null;
  consentedAt: Date | null;
  activeTerm:  ActiveTerm | null;
}

export interface ConsentContextValue extends ConsentState {
  accept:     (prefs: Omit<OptInTypes, 'essential'>) => Promise<void>;
  decline:    () => void;
  isLoading:  boolean;
  /** Retorna true se o tipo foi explicitamente aceito pelo usuário */
  hasConsent: (type: keyof OptInTypes) => boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const CONSENT_STORAGE_KEY   = 'din:consent:v1';
const DEFAULT_PREFERENCES: OptInTypes = {
  essential: true,
  analytics: false,
  marketing: false,
};

// ─────────────────────────────────────────────────────────────────────────────
// Persistência local
// ─────────────────────────────────────────────────────────────────────────────

interface StoredConsent {
  status:      ConsentStatus;
  preferences: OptInTypes;
  version:     string | null;
  consentedAt: string | null;
}

function loadFromStorage(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredConsent;
  } catch {
    return null;
  }
}

function saveToStorage(state: ConsentState): void {
  const stored: StoredConsent = {
    status:      state.status,
    preferences: state.preferences,
    version:     state.version,
    consentedAt: state.consentedAt?.toISOString() ?? null,
  };
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
}

// ─────────────────────────────────────────────────────────────────────────────
// Controle de scripts de terceiros
// ─────────────────────────────────────────────────────────────────────────────

/** Tipos de consentimento mapeados a prefixos de cookies de terceiros */
const THIRD_PARTY_COOKIES: Record<keyof Omit<OptInTypes, 'essential'>, string[]> = {
  analytics: ['_ga', '_gid', '__utma', '__utmb', '__utmz', '_hjid', 'mp_'],
  marketing: ['_fbp', '_fbc', '__gads', 'IDE', 'NID', 'test_cookie'],
};

function purgeThirdPartyCookies(prefixes: string[]): void {
  document.cookie.split(';').forEach((cookie) => {
    const name = cookie.trim().split('=')[0] ?? '';
    if (prefixes.some((prefix) => name.startsWith(prefix))) {
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    }
  });
}

/**
 * Ativa ou desativa scripts de terceiros baseado nas preferências.
 * Scripts no HTML devem usar o padrão:
 *   <script type="text/plain" data-consent-type="analytics" data-src="https://..."></script>
 */
function applyScriptBlocking(prefs: OptInTypes): void {
  if (typeof document === 'undefined') return;

  const optionalTypes: Array<keyof Omit<OptInTypes, 'essential'>> = ['analytics', 'marketing'];

  for (const type of optionalTypes) {
    const blocked = document.querySelectorAll<HTMLScriptElement>(
      `script[data-consent-type="${type}"][type="text/plain"]`
    );

    if (prefs[type]) {
      // Ativar: clonar script com src real para forçar execução
      blocked.forEach((script) => {
        const src = script.dataset.src;
        if (!src) return;
        const activated = document.createElement('script');
        activated.src  = src;
        activated.async = true;
        activated.dataset.consentType = type;
        // Manter o original (com type=text/plain) para referência
        script.parentNode?.insertBefore(activated, script.nextSibling);
        script.dataset.activated = 'true';
      });
    } else {
      // Desativar: limpar cookies (scripts já carregados requerem reload)
      purgeThirdPartyCookies(THIRD_PARTY_COOKIES[type]);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const ConsentContext = createContext<ConsentContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Hook público
// ─────────────────────────────────────────────────────────────────────────────

export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent deve ser usado dentro de ConsentProvider');
  return ctx;
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function ConsentProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();

  const [state, setState] = useState<ConsentState>({
    status:      stored?.status      ?? 'pending',
    preferences: stored?.preferences ?? DEFAULT_PREFERENCES,
    version:     stored?.version     ?? null,
    consentedAt: stored?.consentedAt ? new Date(stored.consentedAt) : null,
    activeTerm:  null,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Buscar termo ativo e consentimento do backend (quando autenticado)
  useEffect(() => {
    const token = localStorage.getItem('@din:token');
    if (!token) return;

    getConsents()
      .then(({ activeTerm, consents }) => {
        const activeConsent = consents.find((c) => c.isActive);

        setState((prev) => ({
          ...prev,
          activeTerm: activeTerm ?? null,
          // Se há consentimento ativo no backend, sincronizar
          ...(activeConsent && {
            status:      'accepted',
            preferences: activeConsent.optInTypes as OptInTypes,
            version:     activeConsent.version,
            consentedAt: new Date(activeConsent.consentedAt),
          }),
          // Se o termo ativo mudou de versão, pedir novo consentimento
          ...(activeTerm && activeConsent && activeTerm.version !== activeConsent.version && {
            status: 'pending',
          }),
        }));
      })
      .catch(() => {
        // Falha silenciosa — usar estado local
      });
  }, []);

  // Aplicar bloqueio de scripts sempre que preferências mudarem
  useEffect(() => {
    applyScriptBlocking(state.preferences);
  }, [state.preferences]);

  const accept = useCallback(
    async (prefs: Omit<OptInTypes, 'essential'>) => {
      setIsLoading(true);
      const newPrefs: OptInTypes = { essential: true, ...prefs };
      const now = new Date();

      const newState: ConsentState = {
        ...state,
        status:      prefs.analytics || prefs.marketing ? 'accepted' : 'partial',
        preferences: newPrefs,
        consentedAt: now,
        version:     state.activeTerm?.version ?? state.version,
      };

      setState(newState);
      saveToStorage(newState);

      // Persistir no backend se houver termo ativo e usuário autenticado
      const token = localStorage.getItem('@din:token');
      if (token && state.activeTerm) {
        try {
          await recordConsent(state.activeTerm.id, newPrefs);
        } catch {
          // Fallback silencioso — consentimento salvo localmente
        }
      }

      setIsLoading(false);
    },
    [state]
  );

  const decline = useCallback(() => {
    const newState: ConsentState = {
      ...state,
      status:      'declined',
      preferences: { essential: true, analytics: false, marketing: false },
      consentedAt: new Date(),
    };
    setState(newState);
    saveToStorage(newState);
  }, [state]);

  const hasConsent = useCallback(
    (type: keyof OptInTypes): boolean => {
      if (type === 'essential') return true;
      return state.status !== 'pending' && state.preferences[type] === true;
    },
    [state]
  );

  return (
    <ConsentContext.Provider value={{ ...state, accept, decline, isLoading, hasConsent }}>
      {children}
    </ConsentContext.Provider>
  );
}
