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
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#080d1a]/95 backdrop-blur-2xl border-t border-slate-800/90 px-3 pb-safe pt-2 shadow-2xl select-none">
      <div className="flex items-center justify-around relative max-w-lg mx-auto">
        {/* Item 1: Início */}
        <NavLink
          to={navItems[0].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all',
              isActive
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{navItems[0].label}</span>
        </NavLink>

        {/* Item 2: Extrato */}
        <NavLink
          to={navItems[1].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all',
              isActive
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <ReceiptText className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{navItems[1].label}</span>
        </NavLink>

        {/* Botão Central de Ação Rápida (+) */}
        <div className="flex flex-col items-center -mt-6">
          <button
            type="button"
            onClick={onOpenQuickAction}
            aria-label="Adicionar Novo Lançamento"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-[#080d1a] active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-emerald-400 mt-1">Novo</span>
        </div>

        {/* Item 3: Boletos */}
        <NavLink
          to={navItems[2].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all',
              isActive
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <CalendarClock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{navItems[2].label}</span>
        </NavLink>

        {/* Item 4: Bancos */}
        <NavLink
          to={navItems[3].to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-1 px-3 min-w-[56px] min-h-[44px] rounded-xl transition-all',
              isActive
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            )
          }
        >
          <Landmark className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">{navItems[3].label}</span>
        </NavLink>
      </div>
    </div>
  );
}
