import React from 'react';
import { Menu, Plus, Sparkles, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewTransaction: () => void;
}

export function Header({ onOpenMobileMenu, onOpenNewTransaction }: HeaderProps) {
  const { user } = useAuth();
  const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // Capitaliza a primeira letra do dia da semana
  const formattedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#080d1a]/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm font-semibold text-slate-200 capitalize">
            Olá, {user?.name ? user.name.split(' ')[0] : 'Bem-vindo'}! 👋
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">{formattedDate}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user?.subscription_tier === 'PRO' && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            WhatsApp IA Ativo
          </div>
        )}

        <Button
          variant="emerald"
          size="sm"
          onClick={onOpenNewTransaction}
          className="shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Transação</span>
        </Button>
      </div>
    </header>
  );
}
