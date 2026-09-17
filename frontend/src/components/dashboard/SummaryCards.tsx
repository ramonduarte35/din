import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { SummaryCardsSkeleton } from '../ui/Skeleton';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { TransactionsSummary } from '../../api/transactions';

interface SummaryCardsProps {
  summary: TransactionsSummary | null;
  isLoading: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  const { maskValue } = usePrivacy();

  if (isLoading || !summary) {
    return <SummaryCardsSkeleton />;
  }

  const { current_month, previous_month, total_balance } = summary;

  // Cálculo de variações percentuais
  const calcDiff = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const incomeDiff = calcDiff(current_month.income, previous_month.income);
  const expenseDiff = calcDiff(current_month.expense, previous_month.expense);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
      {/* 1. Saldo Geral Total */}
      <Card className="relative overflow-hidden group hover:border-din-primary/40 transition-all duration-300 shadow-xl bg-card border-border pt-0">
        {/* Borda acento superior */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-din-primary to-violet-400 rounded-t-xl" />
        <div className="flex items-start justify-between pt-1">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-din-muted">Saldo Geral</p>
            <h3 className={`text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 tracking-tight font-mono truncate ${total_balance >= 0 ? 'text-din-text' : 'text-rose-500'}`}>
              {maskValue(total_balance)}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-din-primary/10 text-din-primary border border-din-primary/20 group-hover:scale-110 transition-transform shrink-0 ml-1">
            <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-[10px] text-din-muted mt-2 pt-2 border-t border-border/60">
          <span>Saldo acumulado total</span>
        </div>
      </Card>

      {/* 2. Receitas do Mês */}
      <Card className="relative overflow-hidden group border-border hover:border-emerald-500/50 transition-all duration-300 shadow-xl bg-card pt-0">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-xl" />
        <div className="flex items-start justify-between pt-1">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-500">Receitas</p>
            <h3 className="text-lg sm:text-2xl font-bold text-emerald-500 mt-0.5 sm:mt-1 tracking-tight font-mono truncate">
              {maskValue(current_month.income)}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0 ml-1">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-[10px] text-din-muted mt-2 flex items-center gap-1">
          {incomeDiff >= 0 ? (
            <span className="text-emerald-500 flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +{incomeDiff}%
            </span>
          ) : (
            <span className="text-rose-500 flex items-center font-semibold">
              <ArrowDownRight className="w-3 h-3" /> {incomeDiff}%
            </span>
          )}
          <span>vs anterior</span>
        </div>
      </Card>

      {/* 3. Despesas do Mês */}
      <Card className="relative overflow-hidden group border-border hover:border-rose-500/50 transition-all duration-300 shadow-xl bg-card pt-0">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 to-red-400 rounded-t-xl" />
        <div className="flex items-start justify-between pt-1">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-rose-500">Despesas</p>
            <h3 className="text-lg sm:text-2xl font-bold text-rose-500 mt-0.5 sm:mt-1 tracking-tight font-mono truncate">
              {maskValue(current_month.expense)}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform shrink-0 ml-1">
            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className="text-[10px] text-din-muted mt-2 flex items-center gap-1">
          {expenseDiff > 0 ? (
            <span className="text-rose-500 flex items-center font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +{expenseDiff}%
            </span>
          ) : (
            <span className="text-emerald-500 flex items-center font-semibold">
              <ArrowDownRight className="w-3 h-3" /> {expenseDiff}%
            </span>
          )}
          <span>vs anterior</span>
        </div>
      </Card>

      {/* 4. Balanço Líquido do Mês */}
      <Card className="relative overflow-hidden group border-border hover:border-din-primary/40 transition-all duration-300 shadow-xl bg-card pt-0">
        <div className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-xl ${current_month.balance >= 0 ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-red-400'}`} />
        <div className="flex items-start justify-between pt-1">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-din-muted">Saldo Mês</p>
            <h3
              className={`text-lg sm:text-2xl font-bold mt-0.5 sm:mt-1 tracking-tight font-mono truncate ${
                current_month.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {maskValue(current_month.balance)}
            </h3>
          </div>
          <div className="p-2 sm:p-2.5 rounded-xl bg-card-secondary text-din-muted border border-border group-hover:scale-110 transition-transform shrink-0 ml-1">
            <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
        <p className="text-[10px] text-din-muted mt-2 truncate">
          {current_month.transactions_count} lançamentos
        </p>
      </Card>
    </div>
  );
}
