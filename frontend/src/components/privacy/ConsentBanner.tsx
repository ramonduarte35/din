/**
 * @file ConsentBanner.tsx
 * @description Banner de consentimento LGPD com aceites granulares.
 *
 * Features:
 * - Mobile-first, touch targets ≥ 44px
 * - Toggles acessíveis (role="switch", aria-checked)
 * - 3 opções: Somente essenciais | Salvar seleção | Aceitar todos
 * - Animação suave de entrada (slide-up)
 */

import React, { useState } from 'react';
import { Shield, Cookie, BarChart2, Megaphone, ChevronDown } from 'lucide-react';
import type { OptInTypes } from '../../api/privacy';

interface ConsentBannerProps {
  onAccept:  (prefs: Omit<OptInTypes, 'essential'>) => void;
  onDecline: () => void;
  isLoading: boolean;
}

interface ConsentOption {
  key:         keyof Omit<OptInTypes, 'essential'>;
  label:       string;
  description: string;
  icon:        React.ReactNode;
}

const CONSENT_OPTIONS: ConsentOption[] = [
  {
    key:   'analytics',
    label: 'Analíticos',
    description: 'Nos ajudam a entender como você usa o MeuDino para melhorar a experiência (ex: Google Analytics).',
    icon: <BarChart2 size={17} />,
  },
  {
    key:   'marketing',
    label: 'Marketing',
    description: 'Permitem personalizar anúncios e medir campanhas do Google AdSense.',
    icon: <Megaphone size={17} />,
  },
];

export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onAccept,
  onDecline,
  isLoading,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<Omit<OptInTypes, 'essential'>>({
    analytics: false,
    marketing: false,
  });

  const togglePref = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    /* Overlay com animação slide-up */
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Gerenciamento de Cookies e Privacidade"
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-5 animate-[slideUp_0.3s_ease-out]"
      style={{ animation: 'slideUp 0.3s ease-out' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-none" />

      <div className="relative max-w-xl mx-auto bg-gray-950 border border-gray-700/80 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">

        {/* Barra decorativa superior */}
        <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

        {/* Header */}
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="flex-shrink-0 mt-0.5 p-2 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
            <Shield size={20} className="text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white leading-tight">
              Sua privacidade importa
            </h2>
            <p className="mt-1 text-xs text-gray-400 leading-relaxed">
              Usamos cookies essenciais para funcionar. Com sua permissão, também usamos cookies analíticos e de marketing.
              Altere quando quiser em{' '}
              <strong className="text-gray-300">Configurações → Privacidade</strong>.
            </p>
          </div>
        </div>

        {/* Seção de personalização (collapsible) */}
        <div className="px-4 sm:px-5">
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="flex items-center gap-1.5 pb-3 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            aria-expanded={showDetails}
          >
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
            />
            {showDetails ? 'Ocultar detalhes' : 'Personalizar preferências'}
          </button>

          {showDetails && (
            <div className="pb-4 space-y-2.5">
              {/* Essenciais — sempre ativos */}
              <div className="flex items-start gap-2.5 p-3 bg-gray-900/80 rounded-xl border border-gray-800">
                <Cookie size={16} className="mt-0.5 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-gray-300">Essenciais</span>
                    <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Sempre ativos
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">
                    Necessários para autenticação, segurança e funcionamento básico.
                  </p>
                </div>
              </div>

              {/* Opcionais com toggle */}
              {CONSENT_OPTIONS.map((opt) => (
                <div
                  key={opt.key}
                  className="flex items-start gap-2.5 p-3 bg-gray-900/80 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors"
                >
                  <span className="mt-0.5 text-gray-500 flex-shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-300">{opt.label}</span>
                      {/* Toggle switch acessível */}
                      <button
                        id={`consent-toggle-${opt.key}`}
                        type="button"
                        role="switch"
                        aria-checked={prefs[opt.key]}
                        aria-label={`${opt.label}: ${prefs[opt.key] ? 'ativo' : 'inativo'}`}
                        onClick={() => togglePref(opt.key)}
                        className={`relative flex-shrink-0 w-9 h-5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${
                          prefs[opt.key] ? 'bg-emerald-500' : 'bg-gray-700'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            prefs[opt.key] ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="mt-1 text-[11px] text-gray-500 leading-relaxed">{opt.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 px-4 sm:px-5 pb-4 sm:pb-5 pt-1 border-t border-gray-800/60">
          <button
            type="button"
            onClick={onDecline}
            disabled={isLoading}
            className="flex-1 px-3 py-2.5 text-xs font-semibold text-gray-400 bg-gray-900 hover:bg-gray-800 border border-gray-700/60 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
          >
            Somente essenciais
          </button>

          {showDetails && (
            <button
              type="button"
              onClick={() => onAccept(prefs)}
              disabled={isLoading}
              className="flex-1 px-3 py-2.5 text-xs font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-600/60 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
            >
              Salvar seleção
            </button>
          )}

          <button
            type="button"
            onClick={() => onAccept({ analytics: true, marketing: true })}
            disabled={isLoading}
            className="flex-1 px-3 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors min-h-[44px] disabled:opacity-50 shadow-lg shadow-emerald-900/30"
          >
            {isLoading ? 'Salvando...' : 'Aceitar todos'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Keyframe para animação (injetar se não existir no CSS global)
const SLIDE_UP_STYLE = `
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
`;

if (typeof document !== 'undefined' && !document.getElementById('consent-banner-anim')) {
  const style = document.createElement('style');
  style.id = 'consent-banner-anim';
  style.textContent = SLIDE_UP_STYLE;
  document.head.appendChild(style);
}
