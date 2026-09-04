import React from 'react';
import { TransactionsSummary } from '../../api/transactions';
import { Card } from '../ui/Card';
import { CardSkeleton } from '../ui/Skeleton';
import { Activity, TrendingUp, ShieldCheck, AlertCircle, Sparkles, ArrowUpRight, ArrowDownRight, Target } from 'lucide-react';
import { usePrivacy } from '../../contexts/PrivacyContext';

interface FinancialHealthWidgetProps {
  summary: TransactionsSummary | null;
  isLoading: boolean;
}

export function FinancialHealthWidget({ summary, isLoading }: FinancialHealthWidgetProps) {
  const { maskValue } = usePrivacy();

  if (isLoading || !summary) {
    return <CardSkeleton className="h-64" />;
  }

  const income = summary.current_month?.income || 0;
  const expense = summary.current_month?.expense || 0;
  const balance = summary.current_month?.balance || 0;
  const totalBalance = summary.total_balance || 0;

  // 1. Taxa de Poupança (Margem) — até 45 pontos
  let savingsScore = 20;
  let savingsRate = 0;
  if (income > 0) {
    savingsRate = Math.round(((income - expense) / income) * 100);
    if (savingsRate >= 30) savingsScore = 45;
    else if (savingsRate >= 15) savingsScore = 35;
    else if (savingsRate >= 0) savingsScore = 25;
    else if (savingsRate >= -15) savingsScore = 15;
    else savingsScore = 5;
  } else if (expense === 0) {
    savingsScore = 25; // sem movimentação
  } else {
    savingsScore = 10;
  }

  // 2. Reserva e Saldo Acumulado — até 30 pontos
  let balanceScore = 15;
  if (totalBalance > (expense * 3) && expense > 0) balanceScore = 30; // 3 meses de despesas
  else if (totalBalance > expense && expense > 0) balanceScore = 25;
  else if (totalBalance > 0) balanceScore = 20;
  else balanceScore = 5;

  // 3. Controle vs Mês Anterior — até 25 pontos
  const prevExpense = summary.previous_month?.expense || 0;
  let trendScore = 20;
  if (prevExpense > 0 && expense > 0) {
    if (expense < prevExpense) trendScore = 25; // reduziu gastos
    else if (expense <= prevExpense * 1.05) trendScore = 20; // estável
    else trendScore = 10; // aumentou gastos
  }

  const totalScore = Math.min(100, Math.max(0, savingsScore + balanceScore + trendScore));

  // Níveis de diagnóstico
  let level = {
    title: 'Excelente',
    color: 'text-emerald-400',
    bgBadge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    ringColor: 'stroke-emerald-400',
    gradient: 'from-emerald-500 to-teal-400',
    tip: 'Suas finanças estão blindadas! Você tem ótima margem para investir em metas e renda passiva.',
  };

  if (totalScore < 50) {
    level = {
      title: 'Atenção Crítica',
      color: 'text-rose-400',
      bgBadge: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      ringColor: 'stroke-rose-400',
      gradient: 'from-rose-500 to-red-600',
      tip: 'Você está gastando mais do que ganha neste mês. Revise despesas não essenciais para evitar endividamento.',
    };
  } else if (totalScore < 70) {
    level = {
      title: 'Regular / Equilibrado',
      color: 'text-amber-400',
      bgBadge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      ringColor: 'stroke-amber-400',
      gradient: 'from-amber-400 to-amber-600',
      tip: 'Seu saldo está no zero a zero. Tente poupar ao menos 10% da sua renda criando uma meta no Din.',
    };
  } else if (totalScore < 85) {
    level = {
      title: 'Muito Bom',
      color: 'text-teal-400',
      bgBadge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      ringColor: 'stroke-teal-400',
      gradient: 'from-teal-400 to-emerald-500',
      tip: 'Fluxo de caixa saudável e positivo. Mantenha o ritmo para aumentar sua reserva financeira.',
    };
  }

  // Circunferência do gauge SVG (raio 38 -> perímetro ~238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (totalScore / 100) * circumference;

  return (
    <Card className="p-5 border-border bg-card rounded-3xl shadow-xl relative overflow-hidden">
      {/* Efeito Glow */}
      <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none bg-gradient-to-tr ${level.gradient}`} />

      {/* Header do Widget */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-din-text flex items-center gap-2">
              <span>Saúde Financeira</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${level.bgBadge}`}>
                {level.title}
              </span>
            </h3>
            <p className="text-xs text-din-muted">Diagnóstico em tempo real com base no seu fluxo</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-xs text-din-muted">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Análise IA Din</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Anel de Score Radial SVG (4 cols) */}
        <div className="md:col-span-4 flex items-center justify-center sm:justify-start gap-4 p-2">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
              {/* Fundo do círculo */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className="stroke-card-secondary"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progresso com animação */}
              <circle
                cx="48"
                cy="48"
                r={radius}
                className={`${level.ringColor} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Valor central */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black font-mono text-din-text leading-none tracking-tight">
                {totalScore}
              </span>
              <span className="text-[10px] font-semibold text-din-muted uppercase tracking-wider mt-0.5">
                de 100
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-din-muted">Taxa de Poupança</p>
            <p className={`text-base font-bold font-mono ${savingsRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {savingsRate > 0 ? `+${savingsRate}%` : `${savingsRate}%`}
            </p>
            <p className="text-[11px] text-din-muted truncate">
              {balance >= 0 ? `Sobra: ${maskValue(balance)}` : `Déficit: ${maskValue(balance)}`}
            </p>
          </div>
        </div>

        {/* 3 Pilares com Barras (5 cols) */}
        <div className="md:col-span-5 space-y-2.5 text-xs">
          {/* Pilar 1 */}
          <div>
            <div className="flex justify-between text-din-muted font-medium mb-1">
              <span>Margem de Receita</span>
              <span className="text-din-text font-bold">{savingsScore}/45 pts</span>
            </div>
            <div className="h-1.5 w-full bg-card-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{ width: `${(savingsScore / 45) * 100}%` }}
              />
            </div>
          </div>

          {/* Pilar 2 */}
          <div>
            <div className="flex justify-between text-din-muted font-medium mb-1">
              <span>Reserva & Liquidez Total</span>
              <span className="text-din-text font-bold">{balanceScore}/30 pts</span>
            </div>
            <div className="h-1.5 w-full bg-card-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${(balanceScore / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Pilar 3 */}
          <div>
            <div className="flex justify-between text-din-muted font-medium mb-1">
              <span>Controle de Despesas vs Mês Anterior</span>
              <span className="text-din-text font-bold">{trendScore}/25 pts</span>
            </div>
            <div className="h-1.5 w-full bg-card-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${(trendScore / 25) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Dica da IA (3 cols) */}
        <div className="md:col-span-3 p-3.5 rounded-2xl bg-card-secondary/70 border border-border/80 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Dica do Din</span>
          </div>
          <p className="text-[11px] text-din-muted leading-relaxed">
            {level.tip}
          </p>
        </div>
      </div>
    </Card>
  );
}
