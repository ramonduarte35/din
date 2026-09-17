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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 animate-fade-in">
      {/* 1. Saldo Geral Total */}
      <Card className="relative overflow-hidden group hover:border-din-primary/40 transition-all duration-300 shadow-xl bg-card border-border p-4 sm:p-5 pt-3.5 sm:pt-4">
        {/* Borda acento superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-din-primary to-violet-400 rounded-t-xl" />
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-din-muted">Saldo Geral</p>
            <h3 className={`text-xl sm:text-2xl font-bold mt-1 tracking-tight font-mono whitespace-nowrap ${total_balance >= 0 ? 'text-din-text' : 'text-rose-500'}`}>
              {maskValue(total_balance)}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-din-primary/10 text-din-primary border border-din-primary/20 group-hover:scale-110 transition-transform shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="text-xs text-din-muted mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
          <span>Saldo acumulado total</span>
        </div>
      </Card>

      {/* 2. Receitas do Mês */}
      <Card className="relative overflow-hidden group border-border hover:border-emerald-500/50 transition-all duration-300 shadow-xl bg-card p-4 sm:p-5 pt-3.5 sm:pt-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-t-xl" />
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">Receitas</p>
            <h3 className="text-xl sm:text-2xl font-bold text-emerald-500 mt-1 tracking-tight font-mono whitespace-nowrap">
              {maskValue(current_month.income)}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="text-xs text-din-muted mt-2.5 pt-2 border-t border-border/60 flex items-center gap-1">
          {incomeDiff >= 0 ? (
            <span className="text-emerald-500 flex items-center font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{incomeDiff}%
            </span>
          ) : (
            <span className="text-rose-500 flex items-center font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> {incomeDiff}%
            </span>
          )}
          <span>vs mês anterior</span>
        </div>
      </Card>

      {/* 3. Despesas do Mês */}
      <Card className="relative overflow-hidden group border-border hover:border-rose-500/50 transition-all duration-300 shadow-xl bg-card p-4 sm:p-5 pt-3.5 sm:pt-4">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-400 rounded-t-xl" />
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">Despesas</p>
            <h3 className="text-xl sm:text-2xl font-bold text-rose-500 mt-1 tracking-tight font-mono whitespace-nowrap">
              {maskValue(current_month.expense)}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 group-hover:scale-110 transition-transform shrink-0">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="text-xs text-din-muted mt-2.5 pt-2 border-t border-border/60 flex items-center gap-1">
          {expenseDiff > 0 ? (
            <span className="text-rose-500 flex items-center font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{expenseDiff}%
            </span>
          ) : (
            <span className="text-emerald-500 flex items-center font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> {expenseDiff}%
            </span>
          )}
          <span>vs mês anterior</span>
        </div>
      </Card>

      {/* 4. Balanço Líquido do Mês */}
      <Card className="relative overflow-hidden group border-border hover:border-din-primary/40 transition-all duration-300 shadow-xl bg-card p-4 sm:p-5 pt-3.5 sm:pt-4">
        <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${current_month.balance >= 0 ? 'bg-gradient-to-r from-teal-400 to-emerald-400' : 'bg-gradient-to-r from-rose-500 to-red-400'}`} />
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-din-muted">Saldo Mês</p>
            <h3
              className={`text-xl sm:text-2xl font-bold mt-1 tracking-tight font-mono whitespace-nowrap ${
                current_month.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {maskValue(current_month.balance)}
            </h3>
          </div>
          <div className="p-2.5 sm:p-3 rounded-xl bg-card-secondary text-din-muted border border-border group-hover:scale-110 transition-transform shrink-0">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
        <div className="text-xs text-din-muted mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between">
          <span>{current_month.transactions_count} lançamentos</span>
        </div>
      </Card>
    </div>
  );
}
