import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home, Zap } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400">
        <Zap className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white">404</h1>
      <p className="text-sm text-slate-400 max-w-sm">
        A página que você está procurando não existe ou foi movida.
      </p>
      <NavLink to="/">
        <Button variant="emerald" size="sm">
          <Home className="w-4 h-4 mr-1.5" />
          Voltar ao Início
        </Button>
      </NavLink>
    </div>
  );
}
