import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function AccessDenied() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 sm:p-6 select-none animate-fade-in">
      {/* Icon Badge */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/10 mb-5">
        <ShieldAlert className="w-8 h-8 sm:w-10 sm:h-10" />
      </div>

      {/* Heading */}
      <span className="text-[11px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-400 border border-rose-500/30 mb-2">
        Acesso Restrito
      </span>

      <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
        Sem Permissão
      </h1>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2.5 leading-relaxed">
        Você não possui permissão para acessar o painel de administração do sistema. 
        Esta área é exclusiva para o e-mail configurado como administrador no ambiente.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 w-full sm:w-auto">
        <NavLink to="/" className="w-full sm:w-auto">
          <Button
            variant="emerald"
            size="md"
            className="w-full sm:w-auto min-h-[44px] min-w-[44px] px-5 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/20"
          >
            <Home className="w-4 h-4 mr-2" />
            <span>Voltar ao Dashboard</span>
          </Button>
        </NavLink>

        <NavLink to="/profile" className="w-full sm:w-auto">
          <Button
            variant="secondary"
            size="md"
            className="w-full sm:w-auto min-h-[44px] min-w-[44px] px-4 text-xs sm:text-sm text-slate-300 border border-slate-700/80 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>Meu Perfil</span>
          </Button>
        </NavLink>
      </div>
    </div>
  );
}
