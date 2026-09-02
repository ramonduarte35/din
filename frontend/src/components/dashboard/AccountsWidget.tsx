import React from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../../api/accounts';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import {
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  Building2,
  ChevronRight,
  Plus,
  Star,
} from 'lucide-react';

interface AccountsWidgetProps {
  accounts: Account[];
  isLoading: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  Building2,
};

export function AccountsWidget({ accounts, isLoading }: AccountsWidgetProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-slate-800 rounded animate-pulse" />
          <div className="h-4 w-20 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Suas Contas & Bancos
          </h2>
        </div>

        <Link
          to="/accounts"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
        >
          <span>Gerenciar Contas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {accounts.map((acc) => {
          const IconComp = ICON_MAP[acc.icon] || Landmark;
          const isNegative = (acc.current_balance || 0) < 0;

          return (
            <Link
              key={acc.id}
              to="/accounts"
              className="block group transition-transform active:scale-[0.99]"
            >
              <Card className="p-3.5 bg-gradient-to-br from-slate-900/90 to-slate-950 border-slate-800 hover:border-slate-700 transition-all relative overflow-hidden shadow-md">
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: acc.color || '#10b981' }}
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow"
                      style={{
                        backgroundColor: `${acc.color || '#10b981'}20`,
                        color: acc.color || '#10b981',
                        border: `1px solid ${acc.color || '#10b981'}40`,
                      }}
                    >
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100 group-hover:text-white truncate max-w-[130px]">
                          {acc.name}
                        </span>
                        {acc.is_default && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {acc.type === 'CHECKING'
                          ? 'Conta Corrente'
                          : acc.type === 'SAVINGS'
                          ? 'Poupança'
                          : acc.type === 'INVESTMENT'
                          ? 'Investimentos'
                          : acc.type === 'CREDIT_CARD'
                          ? 'Cartão'
                          : 'Carteira'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">Saldo</span>
                    <span
                      className={`text-sm font-black tracking-tight ${
                        isNegative ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrency(acc.current_balance || 0)}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
