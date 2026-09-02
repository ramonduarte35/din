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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
      {/* 1. Saldo Geral Total */}
      <Card className="relative overflow-hidden group hover:border-indigo-500/40 transition-all duration-300 shadow-xl bg-gradient-to-br from-[#0c1322] to-[#080e1b]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Geral</p>
            <h3 className={`text-2xl font-bold mt-1 tracking-tight font-mono ${total_balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {maskValue(total_balance)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <span>Acumulado histórico consolidado</span>
        </p>
      </Card>

      {/* 2. Receitas do Mês */}
      <Card className="relative overflow-hidden group border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 shadow-xl bg-gradient-to-br from-[#0c1322] to-[#08131d]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Receitas do Mês</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 tracking-tight font-mono">
              {maskValue(current_month.income)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
          {incomeDiff >= 0 ? (
            <span className="text-emerald-400 flex items-center font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{incomeDiff}%
            </span>
          ) : (
            <span className="text-rose-400 flex items-center font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> {incomeDiff}%
            </span>
          )}
          <span>vs mês anterior</span>
        </div>
      </Card>

      {/* 3. Despesas do Mês */}
      <Card className="relative overflow-hidden group border-rose-500/20 hover:border-rose-500/50 transition-all duration-300 shadow-xl bg-gradient-to-br from-[#0c1322] to-[#150d1a]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Despesas do Mês</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1 tracking-tight font-mono">
              {maskValue(current_month.expense)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-1.5">
          {expenseDiff > 0 ? (
            <span className="text-rose-400 flex items-center font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> +{expenseDiff}%
            </span>
          ) : (
            <span className="text-emerald-400 flex items-center font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> {expenseDiff}%
            </span>
          )}
          <span>vs mês anterior</span>
        </div>
      </Card>

      {/* 4. Balanço Líquido do Mês */}
      <Card className="relative overflow-hidden group border-slate-700/80 hover:border-slate-600 transition-all duration-300 shadow-xl bg-gradient-to-br from-[#0c1322] to-[#0d1525]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Líquido Mês</p>
            <h3
              className={`text-2xl font-bold mt-1 tracking-tight font-mono ${
                current_month.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {maskValue(current_month.balance)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 group-hover:scale-110 transition-transform">
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <span>{current_month.transactions_count} lançamentos neste mês</span>
        </p>
      </Card>
    </div>
  );
}
