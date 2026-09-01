import React, { useState, useEffect } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { MonthlyComparisonChart } from '../components/dashboard/MonthlyComparisonChart';
import { WhatsAppNumbersCard } from '../components/dashboard/WhatsAppNumbersCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { getTransactionsSummaryRequest, TransactionsSummary } from '../api/transactions';
import { getSystemNumbersRequest, SystemWhatsAppNumber } from '../api/system-numbers';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout/AppLayout';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { user } = useAuth();
  const { refreshKey } = useLayout();

  const [summary, setSummary] = useState<TransactionsSummary | null>(null);
  const [systemNumbers, setSystemNumbers] = useState<SystemWhatsAppNumber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [sumRes, numRes] = await Promise.all([
        getTransactionsSummaryRequest(),
        getSystemNumbersRequest(),
      ]);
      setSummary(sumRes);
      setSystemNumbers(numRes);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Header com boas-vindas e botão de atualizar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Painel Financeiro</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Tempo Real
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe o fluxo de caixa, relatórios de gastos e assistente WhatsApp
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadData(false)}
          isLoading={isRefreshing}
          className="self-start sm:self-auto h-8 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* 1. Cards de Resumo / KPIs */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* 2. WhatsApp Bot Official Numbers Widget */}
      <WhatsAppNumbersCard
        systemNumbers={systemNumbers}
        isLoading={isLoading}
        userPhone={user?.phone_number || null}
      />

      {/* 3. Gráficos Comparativos e Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyComparisonChart
          data={summary?.monthly_history || []}
          isLoading={isLoading}
        />
        <CategoryChart
          data={summary?.category_breakdown || []}
          isLoading={isLoading}
        />
      </div>

      {/* 4. Transações Recentes */}
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactionsCard
          transactions={summary?.recent_transactions || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
