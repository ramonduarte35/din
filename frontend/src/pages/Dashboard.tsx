import React, { useState, useEffect } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { AccountsWidget } from '../components/dashboard/AccountsWidget';
import { BillsWidget } from '../components/dashboard/BillsWidget';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { MonthlyComparisonChart } from '../components/dashboard/MonthlyComparisonChart';
import { WhatsAppNumbersCard } from '../components/dashboard/WhatsAppNumbersCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { getTransactionsSummaryRequest, TransactionsSummary } from '../api/transactions';
import { getSystemNumbersRequest, SystemWhatsAppNumber } from '../api/system-numbers';
import { getAccountsRequest, Account } from '../api/accounts';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout/AppLayout';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function Dashboard() {
  const { user } = useAuth();
  const { refreshKey } = useLayout();

  const [summary, setSummary] = useState<TransactionsSummary | null>(null);
  const [systemNumbers, setSystemNumbers] = useState<SystemWhatsAppNumber[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [sumRes, numRes, accsRes] = await Promise.all([
        getTransactionsSummaryRequest(),
        getSystemNumbersRequest(),
        getAccountsRequest(),
      ]);
      setSummary(sumRes);
      setSystemNumbers(numRes);
      setAccounts(accsRes);
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
          <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight flex items-center gap-2">
            <span>Painel Financeiro</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-din-primary/10 text-din-primary border border-din-primary/20">
              Tempo Real
            </span>
          </h1>
          <p className="text-xs text-din-muted mt-0.5">
            Acompanhe o fluxo de caixa, saldos por conta e assistente WhatsApp
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => loadData(false)}
          isLoading={isRefreshing}
          className="self-start sm:self-auto h-9 min-h-[44px] text-xs px-3"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* 1. Cards de Resumo / KPIs Gerais */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* 2. Widget de Contas Bancárias & Saldos Separados */}
      <AccountsWidget accounts={accounts} isLoading={isLoading} />

      {/* 3. Contas a Pagar & WhatsApp Bot Numbers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BillsWidget />
        <WhatsAppNumbersCard
          systemNumbers={systemNumbers}
          isLoading={isLoading}
          userPhone={user?.phone_number || null}
        />
      </div>

      {/* 4. Gráficos Comparativos e Categorias */}
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

      {/* 5. Transações Recentes */}
      <div className="grid grid-cols-1 gap-6">
        <RecentTransactionsCard
          transactions={summary?.recent_transactions || []}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
