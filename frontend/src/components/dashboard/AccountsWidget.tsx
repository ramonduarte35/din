import React from 'react';
import { Link } from 'react-router-dom';
import { Account } from '../../api/accounts';
import { Card } from '../ui/Card';
import { AccountsWidgetSkeleton } from '../ui/Skeleton';
import { usePrivacy } from '../../contexts/PrivacyContext';
import {
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  Building2,
  ChevronRight,
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
  const { maskValue } = usePrivacy();

  if (isLoading) {
    return <AccountsWidgetSkeleton />;
  }

  if (accounts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Landmark className="w-4 h-4 text-din-primary" />
          <h2 className="text-sm font-bold text-din-text uppercase tracking-wider">
            Suas Contas & Bancos
          </h2>
        </div>

        <Link
          to="/accounts"
          className="text-xs font-semibold text-din-primary hover:opacity-80 flex items-center gap-0.5 transition-colors min-h-[44px] sm:min-h-0 items-center"
        >
          <span>Gerenciar Contas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {accounts.map((acc) => {
          const IconComp = ICON_MAP[acc.icon] || Landmark;
          const isNegative = (acc.current_balance || 0) < 0;

          return (
            <Link
              key={acc.id}
              to="/accounts"
              className="block group transition-transform active:scale-[0.99]"
            >
              <Card className="p-3.5 bg-card border-border hover:border-din-primary/40 transition-all relative overflow-hidden shadow-lg">
                {/* Accent bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: acc.color || '#10b981' }}
                />

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
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
                        <span className="text-xs font-bold text-din-text group-hover:text-din-primary truncate max-w-[130px]">
                          {acc.name}
                        </span>
                        {acc.is_default && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-din-muted block">
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
                    <span className="text-[10px] text-din-muted block">Saldo</span>
                    <span
                      className={`text-sm font-bold font-mono tracking-tight ${
                        isNegative ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {maskValue(acc.current_balance || 0)}
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
