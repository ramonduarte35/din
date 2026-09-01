import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ReceiptText,
  Bot,
  User as UserIcon,
  LogOut,
  Sparkles,
  Zap,
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
      to: '/simulator',
      label: 'Simulador WhatsApp',
      icon: Bot,
      highlight: true,
    },
    {
      to: '/profile',
      label: 'Perfil & WhatsApp',
      icon: UserIcon,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 flex flex-col h-full bg-[#0b1120] border-r border-slate-800/80 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400/20">
          <Zap className="w-5 h-5 text-slate-950 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-white">Din</span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AI Finance
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Gestão & WhatsApp</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/15 to-teal-500/5 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <item.icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse-subtle">
                    IA
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Admin Navigation Section */}
        {user?.role === 'ADMIN' && (
          <div className="pt-3 mt-3 border-t border-slate-800/80">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Administração
            </p>
            <NavLink
              to="/admin/whatsapp"
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/15 to-indigo-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Shield
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>Gestão WhatsApp</span>
                  </div>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
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
        <div className="my-4 p-3.5 rounded-xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/25">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Assine o Plano PRO</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Libere o assistente inteligente por áudio e texto no WhatsApp.
          </p>
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className="inline-block mt-2.5 text-xs font-bold text-amber-300 hover:underline"
          >
            Fazer Upgrade &rarr;
          </NavLink>
        </div>
      ) : null}

      {/* User profile footer */}
      <div className="pt-4 border-t border-slate-800/80 mt-auto">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 uppercase flex-shrink-0">
              {user?.name ? user.name.slice(0, 2) : 'D'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Usuário'}</p>
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
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
