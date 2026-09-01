import React from 'react';
import { Wallet, TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/utils';
import { TransactionsSummary } from '../../api/transactions';

interface SummaryCardsProps {
  summary: TransactionsSummary | null;
  isLoading: boolean;
}

export function SummaryCards({ summary, isLoading }: SummaryCardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-slate-900/50 border border-slate-800/80 animate-pulse"
          />
        ))}
      </div>
    );
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Saldo Geral Total */}
      <Card className="relative overflow-hidden group hover:border-slate-700/80">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Geral</p>
            <h3 className={`text-2xl font-bold mt-1 tracking-tight ${total_balance >= 0 ? 'text-white' : 'text-rose-400'}`}>
              {formatCurrency(total_balance)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3 flex items-center gap-1">
          <span>Acumulado histórico da conta</span>
        </p>
      </Card>

      {/* 2. Receitas do Mês */}
      <Card className="relative overflow-hidden group border-emerald-500/20 hover:border-emerald-500/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Receitas do Mês</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 tracking-tight">
              {formatCurrency(current_month.income)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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
      <Card className="relative overflow-hidden group border-rose-500/20 hover:border-rose-500/40">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose-400">Despesas do Mês</p>
            <h3 className="text-2xl font-bold text-rose-400 mt-1 tracking-tight">
              {formatCurrency(current_month.expense)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
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
      <Card className="relative overflow-hidden group border-slate-700/80 hover:border-slate-600">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Saldo Líquido Mês</p>
            <h3
              className={`text-2xl font-bold mt-1 tracking-tight ${
                current_month.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(current_month.balance)}
            </h3>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
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
