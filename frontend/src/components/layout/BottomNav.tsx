import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ReceiptText, CalendarClock, Landmark, Plus } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface BottomNavProps {
  onOpenQuickAction: () => void;
}

export function BottomNav({ onOpenQuickAction }: BottomNavProps) {
  const navItems = [
    {
      to: '/',
      label: 'Início',
      icon: LayoutDashboard,
    },
    {
      to: '/transactions',
      label: 'Extrato',
      icon: ReceiptText,
    },
    // Central Plus Button is rendered separately in the middle
    {
      to: '/bills',
      label: 'Boletos',
      icon: CalendarClock,
    },
    {
      to: '/accounts',
      label: 'Bancos',
      icon: Landmark,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[var(--bg-surface)]/95 backdrop-blur-3xl border-t border-border/50 px-3 pb-safe pt-2 shadow-[0_-1px_0_0_rgba(255,255,255,0.04)] select-none transition-colors duration-300">
      <div className="flex items-center justify-around relative max-w-lg mx-auto">
        {/* Item 1: Início */}
        <NavLink
          to={navItems[0].to}
          end
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all relative',
              isActive
                ? 'text-din-primary font-bold'
                : 'text-din-muted hover:text-din-text'
            )
          }
        >
          {({ isActive }) => (
            <>
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{navItems[0].label}</span>
              {isActive && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-din-primary" />}
            </>
          )}
        </NavLink>

        {/* Item 2: Extrato */}
        <NavLink
          to={navItems[1].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all relative',
              isActive
                ? 'text-din-primary font-bold'
                : 'text-din-muted hover:text-din-text'
            )
          }
        >
          {({ isActive }) => (
            <>
              <ReceiptText className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{navItems[1].label}</span>
              {isActive && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-din-primary" />}
            </>
          )}
        </NavLink>

        {/* Botão Central de Ação Rápida (+) */}
        <div className="flex flex-col items-center -mt-6">
          <button
            type="button"
            onClick={onOpenQuickAction}
            aria-label="Adicionar Novo Lançamento"
            className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-violet-500/40 ring-4 ring-[var(--bg-app)] active:scale-95 transition-all touch-manipulation"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-din-primary mt-1">Novo</span>
        </div>

        {/* Item 3: Boletos */}
        <NavLink
          to={navItems[2].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all relative',
              isActive
                ? 'text-din-primary font-bold'
                : 'text-din-muted hover:text-din-text'
            )
          }
        >
          {({ isActive }) => (
            <>
              <CalendarClock className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{navItems[2].label}</span>
              {isActive && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-din-primary" />}
            </>
          )}
        </NavLink>

        {/* Item 4: Bancos */}
        <NavLink
          to={navItems[3].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all relative',
              isActive
                ? 'text-din-primary font-bold'
                : 'text-din-muted hover:text-din-text'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Landmark className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] tracking-tight">{navItems[3].label}</span>
              {isActive && <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-din-primary" />}
            </>
          )}
        </NavLink>
      </div>
    </div>
  );
}
