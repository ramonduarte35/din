import React, { useEffect } from 'react';
import { ArrowDownRight, ArrowUpRight, CalendarClock, Landmark, X, Zap } from 'lucide-react';

export interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNewTransaction: () => void;
  onSelectNewBill: () => void;
  onSelectNewAccount: () => void;
}

export function QuickActionModal({
  isOpen,
  onClose,
  onSelectNewTransaction,
  onSelectNewBill,
  onSelectNewAccount,
}: QuickActionModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet */}
      <div className="relative w-full max-w-md bg-[#0d1424] border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 z-10 animate-slide-up space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Novo Lançamento</h3>
              <p className="text-[11px] text-slate-400">O que você gostaria de registrar agora?</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Grid Options */}
        <div className="space-y-2.5 pt-1">
          {/* Opção 1: Nova Transação */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectNewTransaction();
            }}
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-850 transition-all flex items-center justify-between group text-left min-h-[56px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Nova Transação
                </h4>
                <p className="text-xs text-slate-400">Receita, despesa rápida ou transferência</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-emerald-400 transition-colors text-lg">&rarr;</span>
          </button>

          {/* Opção 2: Novo Boleto / Conta a Pagar */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectNewBill();
            }}
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-850 transition-all flex items-center justify-between group text-left min-h-[56px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform">
                <CalendarClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                  Conta a Pagar / Boleto
                </h4>
                <p className="text-xs text-slate-400">Agende contas futuras com data de vencimento</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-amber-400 transition-colors text-lg">&rarr;</span>
          </button>

          {/* Opção 3: Nova Conta Bancária */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onSelectNewAccount();
            }}
            className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-850 transition-all flex items-center justify-between group text-left min-h-[56px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-500/20 to-indigo-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white group-hover:text-sky-400 transition-colors">
                  Conta Bancária / Carteira
                </h4>
                <p className="text-xs text-slate-400">Cadastre um banco, cartão ou carteira física</p>
              </div>
            </div>
            <span className="text-slate-500 group-hover:text-sky-400 transition-colors text-lg">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
}
