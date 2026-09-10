import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Landmark,
  CalendarClock,
  Layers,
  Target,
  PieChart,
  Bot,
  User as UserIcon,
  LogOut,
  Sparkles,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ onCloseMobile, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/transactions',
      label: 'Transações',
      icon: ReceiptText,
    },
    {
      to: '/bills',
      label: 'Contas a Pagar',
      icon: CalendarClock,
    },
    {
      to: '/accounts',
      label: 'Contas & Bancos',
      icon: Landmark,
    },
    {
      to: '/categories',
      label: 'Categorias',
      icon: Layers,
    },
    {
      to: '/budgets',
      label: 'Orçamentos',
      icon: PieChart,
    },
    {
      to: '/goals',
      label: 'Metas & Cofrinhos',
      icon: Target,
    },
    {
      to: '/simulator',
      label: 'Simulador de IA',
      icon: Bot,
      highlight: true,
    },
    {
      to: '/profile',
      label: 'Perfil & Integrações',
      icon: UserIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-border select-none transition-all duration-300 ease-in-out shadow-[1px_0_0_0_rgba(255,255,255,0.03)]',
        isCollapsed ? 'w-20 p-2.5 items-center' : 'w-64 p-4'
      )}
    >
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="flex flex-col items-center gap-2.5 py-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-card-secondary border border-border/80 flex items-center justify-center shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20 shrink-0 p-1">
            <img src="/meudino-mascot.png" alt="MeuDino" className="w-8 h-8 object-contain" />
          </div>

          {/* Botão de Expandir no Desktop quando encolhido */}
          {onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Expandir menu lateral"
              title="Expandir menu lateral"
              className="p-2 rounded-xl text-din-muted hover:text-din-primary hover:bg-card-hover border border-border/60 hover:border-din-primary/40 transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
              <ChevronRight className="w-5 h-5 text-din-primary" />
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between px-2 py-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card-secondary border border-border/80 flex items-center justify-center shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20 shrink-0 p-1">
              <img src="/meudino-mascot.png" alt="MeuDino" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-din-text">
                Meu<span className="text-emerald-500">Dino</span>
              </span>
            </div>
          </div>

          {/* Botão de Fechar no Mobile */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Fechar menu lateral"
              title="Fechar menu lateral"
              className="lg:hidden p-2 rounded-xl text-din-muted hover:text-din-text hover:bg-card-hover transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] touch-manipulation"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Botão de Encolher no Desktop quando aberto */}
          {!onCloseMobile && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label="Encolher menu lateral"
              title="Encolher menu lateral"
              className="hidden lg:flex p-2 rounded-xl text-din-muted hover:text-din-text hover:bg-card-hover transition-colors items-center justify-center min-w-[40px] min-h-[40px]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className={cn('flex-1 space-y-1', isCollapsed ? 'w-full px-0' : 'pl-2 space-y-0.5')}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onCloseMobile}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative',
                isCollapsed
                  ? 'justify-center w-11 h-11 mx-auto my-1'
                  : 'justify-between px-3 py-2.5',
                isActive
                  ? 'bg-din-primary/10 text-din-primary font-semibold shadow-sm nav-active-indicator'
                  : 'text-din-muted hover:text-din-text hover:bg-card-hover'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
                  <item.icon
                    className={cn(
                      'transition-colors shrink-0',
                      isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                      isActive ? 'text-din-primary' : 'text-din-muted group-hover:text-din-text'
                    )}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.highlight && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30 animate-pulse-subtle">
                    IA
                  </span>
                )}
                {/* Floating Tooltip quando encolhido */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900/95 dark:bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {item.highlight && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        IA
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Navigation Section */}
        {user?.role === 'ADMIN' && (
          <div className={cn('pt-3 mt-3 border-t border-border', isCollapsed && 'w-full')}>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-din-muted mb-1.5">
                Administração
              </p>
            )}
            <NavLink
              to="/admin/whatsapp"
              onClick={onCloseMobile}
              title={isCollapsed ? 'Canais & Integrações (ADMIN)' : undefined}
              className={({ isActive }) =>
                cn(
                  'flex items-center rounded-xl text-sm font-medium transition-all duration-150 group relative',
                  isCollapsed
                    ? 'justify-center w-11 h-11 mx-auto my-1'
                    : 'justify-between px-3 py-2.5',
                  isActive
                    ? 'bg-din-primary/10 text-din-primary font-semibold shadow-sm nav-active-indicator'
                    : 'text-din-muted hover:text-din-text hover:bg-card-hover'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn('flex items-center', isCollapsed ? 'justify-center' : 'gap-3')}>
                    <Shield
                      className={cn(
                        'transition-colors shrink-0',
                        isCollapsed ? 'w-5 h-5' : 'w-4 h-4',
                        isActive ? 'text-din-primary' : 'text-din-muted group-hover:text-din-text'
                      )}
                    />
                    {!isCollapsed && <span>Canais & Integrações</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-din-primary/20 text-din-primary border border-din-primary/30">
                      ADMIN
                    </span>
                  )}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900/95 dark:bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 flex items-center gap-1.5">
                      <span>Canais & Integrações</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-din-primary/20 text-din-primary border border-din-primary/30">
                        ADMIN
                      </span>
                    </div>
                  )}
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* PRO Upgrade / Banner Widget */}
      {user?.subscription_tier !== 'PRO' ? (
        isCollapsed ? (
          <div className="w-full flex justify-center my-2">
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              title="Assine o Plano PRO"
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600/20 to-indigo-500/10 border border-violet-500/30 text-violet-500 dark:text-violet-400 flex items-center justify-center hover:bg-violet-600/25 transition-colors group relative"
            >
              <Sparkles className="w-5 h-5" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900/95 dark:bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                Assine o Plano PRO
              </div>
            </NavLink>
          </div>
        ) : (
          <div className="my-4 p-3.5 rounded-xl bg-gradient-to-br from-violet-600/10 via-indigo-500/5 to-transparent dark:from-violet-600/15 dark:via-indigo-500/10 border border-violet-500/25 shadow-inner-glow">
            <div className="flex items-center gap-2 text-violet-700 dark:text-violet-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>Assine o Plano PRO</span>
            </div>
            <p className="text-[11px] text-din-muted mt-1 leading-relaxed">
              Libere o assistente inteligente por áudio e texto no WhatsApp.
            </p>
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              className="inline-block mt-2.5 text-xs font-bold text-violet-700 dark:text-violet-300 hover:text-violet-900 dark:hover:text-violet-200 hover:underline transition-colors"
            >
              Fazer Upgrade &rarr;
            </NavLink>
          </div>
        )
      ) : null}

      {/* User profile footer */}
      <div className={cn('pt-3 border-t border-border mt-auto', isCollapsed ? 'w-full' : '')}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1">
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              title={`Perfil: ${user?.name || 'Usuário'}`}
              className="w-10 h-10 rounded-full flex items-center justify-center group relative"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-full object-cover border border-border hover:ring-2 hover:ring-din-primary/40 transition-all"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-din-text uppercase hover:ring-2 hover:ring-din-primary/40 transition-all">
                  {user?.name ? user.name.slice(0, 2) : 'D'}
                </div>
              )}
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900/95 dark:bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                {user?.name || 'Meu Perfil'} ({user?.subscription_tier || 'FREE'})
              </div>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="w-10 h-10 text-din-muted hover:text-rose-400 hover:bg-card-hover rounded-xl transition-colors flex items-center justify-center group relative min-w-[40px] min-h-[40px]"
            >
              <LogOut className="w-4.5 h-4.5" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900/95 dark:bg-slate-800 text-slate-100 text-xs font-semibold rounded-lg shadow-xl border border-border whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                Sair da conta
              </div>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-card-secondary border border-border">
            <NavLink
              to="/profile"
              onClick={onCloseMobile}
              className="flex items-center gap-2.5 overflow-hidden flex-1 hover:opacity-85 transition-opacity"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.name || 'Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-border flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center text-xs font-bold text-din-text uppercase flex-shrink-0">
                  {user?.name ? user.name.slice(0, 2) : 'D'}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-din-text truncate">{user?.name || 'Usuário'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge variant={user?.subscription_tier === 'PRO' ? 'pro' : 'free'} className="text-[9px] py-0 px-1.5">
                    {user?.subscription_tier || 'FREE'}
                  </Badge>
                </div>
              </div>
            </NavLink>
            <button
              type="button"
              onClick={handleLogout}
              title="Sair da conta"
              aria-label="Sair da conta"
              className="p-2 text-din-muted hover:text-rose-400 hover:bg-card-hover rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
