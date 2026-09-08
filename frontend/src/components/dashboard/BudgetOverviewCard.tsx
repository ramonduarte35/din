import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getBudgetsRequest, MonthlyBudgetsResponse } from '../../api/budgets';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatBRL } from '../../lib/utils';
import { PieChart, ArrowUpRight, Plus, AlertTriangle, CheckCircle2, Tag } from 'lucide-react';

interface BudgetOverviewCardProps {
  month?: number;
  year?: number;
}

export function BudgetOverviewCard({ month, year }: BudgetOverviewCardProps) {
  const [data, setData] = useState<MonthlyBudgetsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isPrivate } = usePrivacy();

  useEffect(() => {
    let isMounted = true;
    const fetchBudgets = async () => {
      setIsLoading(true);
      try {
        const res = await getBudgetsRequest(month, year);
        if (isMounted) {
          setData(res);
        }
      } catch (err) {
        console.error('Erro ao carregar resumo de orçamentos:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBudgets();
    return () => {
      isMounted = false;
    };
  }, [month, year]);

  if (isLoading) {
    return (
      <Card className="p-5 border-border bg-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700/30 rounded w-1/3" />
          <div className="h-8 bg-slate-700/20 rounded" />
          <div className="h-3 bg-slate-700/30 rounded w-2/3" />
        </div>
      </Card>
    );
  }

  const summary = data?.summary;
  const budgets = data?.budgets || [];
  const hasBudgets = budgets.length > 0;

  return (
    <Card className="p-5 border-border bg-gradient-to-br from-card to-card-hover shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-din-primary/15 text-din-primary flex items-center justify-center">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-din-text">Orçamento Mensal</h3>
            <p className="text-[11px] text-din-muted">Controle de tetos de gastos</p>
          </div>
        </div>

        <Link
          to="/budgets"
          className="text-xs font-bold text-din-primary hover:underline flex items-center gap-1 min-h-[36px] px-2 py-1 rounded-lg hover:bg-din-primary/10 transition-colors"
        >
          <span>{hasBudgets ? 'Ver Todos' : 'Configurar'}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {hasBudgets && summary ? (
        <div className="space-y-4">
          {/* Barra de Progresso Geral */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-din-muted font-medium">Consumo Geral</span>
              <span
                className={`font-black ${
                  summary.overall_percentage > 100
                    ? 'text-rose-500'
                    : summary.overall_percentage >= 90
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {summary.overall_percentage}%
              </span>
            </div>

            <div className="w-full h-2.5 bg-background rounded-full overflow-hidden p-0.5 border border-border">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.overall_percentage > 100
                    ? 'bg-rose-500'
                    : summary.overall_percentage >= 90
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, summary.overall_percentage)}%` }}
              />
            </div>
          </div>

          {/* Resumo de Valores */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 rounded-xl bg-background/50 border border-border">
              <span className="text-[10px] text-din-muted block">Gasto / Teto</span>
              <span className="text-xs font-bold text-din-text">
                {isPrivate ? '••••' : formatBRL(summary.total_spent)} /{' '}
                {isPrivate ? '••••' : formatBRL(summary.total_budgeted)}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-background/50 border border-border">
              <span className="text-[10px] text-din-muted block">
                {summary.total_remaining >= 0 ? 'Saldo Restante' : 'Excedeu'}
              </span>
              <span
                className={`text-xs font-bold ${
                  summary.total_remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                {isPrivate ? '••••' : formatBRL(Math.abs(summary.total_remaining))}
              </span>
            </div>
          </div>

          {/* Mini lista das categorias em maior alerta */}
          {budgets.slice(0, 3).map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between text-xs py-1.5 border-t border-border/40"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: b.category.color || '#64748b' }}
                />
                <span className="text-din-text truncate font-medium">{b.category.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-din-muted text-[11px]">
                  {isPrivate ? '••' : formatBRL(b.spent_amount)} / {isPrivate ? '••' : formatBRL(b.budgeted_amount)}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    b.status === 'EXCEEDED'
                      ? 'bg-rose-500/15 text-rose-500'
                      : b.status === 'DANGER'
                      ? 'bg-orange-500/15 text-orange-500'
                      : b.status === 'WARNING'
                      ? 'bg-amber-500/15 text-amber-500'
                      : 'bg-emerald-500/15 text-emerald-500'
                  }`}
                >
                  {b.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 space-y-3">
          <p className="text-xs text-din-muted">
            Você ainda não definiu tetos de gastos para este mês.
          </p>
          <Link to="/budgets">
            <Button variant="outline" size="sm" className="min-h-[40px] text-xs">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Definir Tetos de Gastos
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}
