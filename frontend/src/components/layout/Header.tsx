import React, { useState, useRef, useEffect } from 'react';
import { Menu, Plus, Sparkles, MessageSquare, Eye, EyeOff, Palette, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { useTheme } from '../../contexts/ThemeContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewTransaction: () => void;
}

export function Header({ onOpenMobileMenu, onOpenNewTransaction }: HeaderProps) {
  const { user } = useAuth();
  const { isPrivate, togglePrivacy } = usePrivacy();
  const { theme, setTheme, themes, currentThemeConfig } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    }
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // Capitaliza a primeira letra do dia da semana
  const formattedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="h-16 border-b border-border bg-card/85 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Abrir Menu de Navegação"
          className="lg:hidden p-2.5 rounded-xl text-din-muted hover:text-din-text hover:bg-card-hover transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          <Menu className="w-5 h-5" />
        </button>
        {user?.avatar_url && (
          <img
            src={user.avatar_url}
            alt={user.name || 'Avatar'}
            referrerPolicy="no-referrer"
            className="w-8 h-8 rounded-full object-cover border border-border hidden sm:block"
          />
        )}
        <div>
          <h2 className="text-sm font-semibold text-din-text capitalize">
            Olá, {user?.name ? user.name.split(' ')[0] : 'Bem-vindo'}! 👋
          </h2>
          <p className="text-xs text-din-muted hidden sm:block">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Seletor Rápido de Paleta de Cores */}
        <div className="relative" ref={themeMenuRef}>
          <button
            type="button"
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            title={`Paleta atual: ${currentThemeConfig.name}. Clique para trocar.`}
            aria-label="Alternar Paleta de Cores"
            className="p-2.5 rounded-xl text-din-muted hover:text-din-primary hover:bg-card-hover border border-border transition-all flex items-center justify-center min-w-[44px] min-h-[44px] relative"
          >
            <Palette className="w-4 h-4" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-background animate-pulse"
              style={{ backgroundColor: currentThemeConfig.accentColor }}
            />
          </button>

          {/* Menu Dropdown de Temas */}
          {isThemeMenuOpen && (
            <div className="fixed top-16 right-3 sm:absolute sm:top-full sm:right-0 sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-72 max-w-[320px] rounded-2xl bg-card border border-border shadow-2xl p-2.5 z-50 animate-slide-up backdrop-blur-2xl max-h-[80vh] overflow-y-auto">
              <div className="px-3 py-2 border-b border-border mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-din-primary" />
                  <span className="text-xs font-bold text-din-text uppercase tracking-wider">
                    Paleta de Cores
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-din-muted">{themes.length} Opções</span>
              </div>

              <div className="space-y-1">
                {themes.map((t) => {
                  const isActive = t.id === theme;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setTheme(t.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all min-h-[44px] ${
                        isActive
                          ? 'bg-card-hover border border-din-primary/40 text-din-text font-bold shadow-sm'
                          : 'hover:bg-card-hover text-din-muted hover:text-din-text border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Amostra visual da paleta */}
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center p-0.5 border shadow-inner shrink-0"
                          style={{
                            backgroundColor: t.preview.bg,
                            borderColor: isActive ? t.accentColor : 'rgba(150, 150, 150, 0.25)',
                          }}
                        >
                          <div
                            className="w-3.5 h-3.5 rounded-full"
                            style={{ backgroundColor: t.accentColor }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-din-text">{t.name}</span>
                            {t.badge && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-din-primary/15 text-din-primary border border-din-primary/30">
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-din-muted block truncate max-w-[150px]">
                            {t.description}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-slate-950 shrink-0"
                          style={{ backgroundColor: t.accentColor }}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Modo Privacidade (Ocultar/Exibir Saldos) */}
        <button
          type="button"
          onClick={togglePrivacy}
          title={isPrivate ? 'Exibir valores financeiros' : 'Ocultar valores financeiros (Modo Privacidade)'}
          aria-label="Alternar Modo Privacidade"
          className="p-2.5 rounded-xl text-din-muted hover:text-din-primary hover:bg-card-hover border border-border transition-all flex items-center justify-center min-w-[44px] min-h-[44px]"
        >
          {isPrivate ? (
            <EyeOff className="w-4 h-4 text-amber-400" />
          ) : (
            <Eye className="w-4 h-4 text-din-muted" />
          )}
        </button>

        {user?.subscription_tier === 'PRO' && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-din-primary/10 border border-din-primary/20 text-din-primary text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-din-primary animate-pulse"></span>
            WhatsApp IA Ativo
          </div>
        )}

        <Button
          variant="emerald"
          size="sm"
          onClick={onOpenNewTransaction}
          className="shadow-md h-10 px-3 sm:px-4 min-w-[44px] min-h-[44px]"
          aria-label="Nova Transação"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Transação</span>
        </Button>
      </div>
    </header>
  );
}

