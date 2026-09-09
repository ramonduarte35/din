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
  Zap,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export function Sidebar({ onCloseMobile }: SidebarProps) {
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
    <aside className="w-64 flex flex-col h-full bg-[var(--bg-sidebar)] border-r border-border p-4 select-none transition-colors duration-300 shadow-[1px_0_0_0_rgba(255,255,255,0.03)]">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-2 ring-violet-400/20">
          <Zap className="w-4.5 h-4.5 text-white fill-current" style={{ width: '18px', height: '18px' }} />
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-din-text">Din</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 pl-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                isActive
                  ? 'text-white font-semibold nav-active-indicator'
                  : 'text-din-muted hover:text-din-text hover:bg-[var(--bg-surface-elevated)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'w-4 h-4 transition-colors shrink-0',
                      isActive ? 'text-din-primary' : 'text-din-muted group-hover:text-din-text'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 animate-pulse-subtle">
                    IA
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Navigation Section */}
        {user?.role === 'ADMIN' && (
          <div className="pt-3 mt-3 border-t border-border">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-din-muted mb-1.5">
              Administração
            </p>
            <NavLink
              to="/admin/whatsapp"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                  isActive
                    ? 'text-white font-semibold nav-active-indicator'
                    : 'text-din-muted hover:text-din-text hover:bg-[var(--bg-surface-elevated)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Shield
                      className={cn(
                        'w-4 h-4 transition-colors shrink-0',
                        isActive ? 'text-din-primary' : 'text-din-muted group-hover:text-din-text'
                      )}
                    />
                    <span>Canais & Integrações</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-din-primary/20 text-din-primary border border-din-primary/30">
                    ADMIN
                  </span>
                </>
              )}
            </NavLink>
          </div>
        )}
      </nav>

      {/* PRO Upgrade / Banner Widget */}
      {user?.subscription_tier !== 'PRO' ? (
        <div className="my-4 p-3.5 rounded-xl bg-gradient-to-br from-violet-600/15 via-indigo-500/10 to-transparent border border-violet-500/25 shadow-inner-glow">
          <div className="flex items-center gap-2 text-violet-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span>Assine o Plano PRO</span>
          </div>
          <p className="text-[11px] text-din-muted mt-1 leading-relaxed">
            Libere o assistente inteligente por áudio e texto no WhatsApp.
          </p>
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className="inline-block mt-2.5 text-xs font-bold text-violet-300 hover:text-violet-200 hover:underline transition-colors"
          >
            Fazer Upgrade &rarr;
          </NavLink>
        </div>
      ) : null}

      {/* User profile footer */}
      <div className="pt-4 border-t border-border mt-auto">
        <div className="flex items-center justify-between p-2 rounded-xl bg-card-secondary border border-border">
          <div className="flex items-center gap-2.5 overflow-hidden">
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
          </div>
          <button
            onClick={handleLogout}
            title="Sair da conta"
            className="p-1.5 text-din-muted hover:text-rose-400 hover:bg-card-hover rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
