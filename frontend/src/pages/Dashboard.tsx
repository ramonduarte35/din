import React, { useState, useEffect, useCallback } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { FinancialHealthWidget } from '../components/dashboard/FinancialHealthWidget';
import { BudgetOverviewCard } from '../components/dashboard/BudgetOverviewCard';
import { AccountsWidget } from '../components/dashboard/AccountsWidget';
import { BillsWidget } from '../components/dashboard/BillsWidget';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { MonthlyComparisonChart } from '../components/dashboard/MonthlyComparisonChart';
import { WhatsAppNumbersCard } from '../components/dashboard/WhatsAppNumbersCard';
import { RecentTransactionsCard } from '../components/dashboard/RecentTransactionsCard';
import { FinancialReportModal } from '../components/dashboard/FinancialReportModal';
import { getTransactionsSummaryRequest, TransactionsSummary } from '../api/transactions';
import { getSystemNumbersRequest, SystemWhatsAppNumber } from '../api/system-numbers';
import { getAccountsRequest, Account } from '../api/accounts';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../components/layout/AppLayout';
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, Calendar, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MONTH_NAMES } from '../lib/utils';

export function Dashboard() {
  const { user } = useAuth();
  const { refreshKey } = useLayout();

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const isCurrentMonth = selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const [summary, setSummary] = useState<TransactionsSummary | null>(null);
  const [systemNumbers, setSystemNumbers] = useState<SystemWhatsAppNumber[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);
    setErrorMessage(null);

    try {
      const [sumRes, numRes, accsRes] = await Promise.all([
        getTransactionsSummaryRequest({ month: selectedMonth, year: selectedYear }),
        getSystemNumbersRequest(),
        getAccountsRequest(),
      ]);
      setSummary(sumRes);
      setSystemNumbers(numRes);
      setAccounts(accsRes);
    } catch (err) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setErrorMessage('Não foi possível carregar os dados financeiros deste período. Verifique sua conexão e tente novamente.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (isCurrentMonth) return; // Não avançar além do mês atual
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleGoToCurrentMonth = () => {
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Header com boas-vindas, seletor de período e botão de atualizar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight flex items-center gap-2">
            <span>Painel Financeiro</span>
            {isCurrentMonth ? (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-din-primary/10 text-din-primary border border-din-primary/20">
                Tempo Real
              </span>
            ) : (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Histórico
              </span>
            )}
          </h1>
          <p className="text-xs text-din-muted mt-0.5">
            Acompanhe o fluxo de caixa, saldos por conta e assistente de IA
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Navegação de Período */}
          <div className="flex items-center gap-1 bg-card-secondary border border-border rounded-xl p-1 flex-1 sm:flex-initial justify-between sm:justify-start">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-lg hover:bg-card-hover text-din-muted hover:text-din-text transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 touch-manipulation"
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={!isCurrentMonth ? handleGoToCurrentMonth : undefined}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-din-text flex-1 sm:flex-initial sm:min-w-[130px] justify-center min-h-[44px] touch-manipulation"
              title={!isCurrentMonth ? 'Clique para ir ao mês atual' : undefined}
            >
              <Calendar className="w-3.5 h-3.5 text-din-primary" />
              <span>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
            </button>

            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className="p-2 rounded-lg hover:bg-card-hover text-din-muted hover:text-din-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 touch-manipulation"
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsReportModalOpen(true)}
              className="flex-1 sm:flex-initial h-10 min-h-[44px] text-xs px-3.5 border-border hover:border-din-primary/40 text-din-text hover:text-din-primary"
              title="Exportar demonstrativo executivo mensal em PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1.5 text-din-primary" />
              Relatório PDF
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadData(false)}
              isLoading={isRefreshing}
              className="flex-1 sm:flex-initial h-10 min-h-[44px] text-xs px-3.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Estado de Erro com Ação de Recuperação */}
      {errorMessage && !isLoading && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in"
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-sm font-medium">{errorMessage}</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => loadData(true)}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-white min-h-[44px] sm:self-auto self-start"
          >
            Tentar novamente
          </Button>
        </div>
      )}

      {/* 1. Cards de Resumo / KPIs Gerais */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* 2. Score de Saúde Financeira com IA & Orçamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FinancialHealthWidget summary={summary} isLoading={isLoading} />
        <BudgetOverviewCard month={selectedMonth} year={selectedYear} />
      </div>

      {/* 3. Widget de Contas Bancárias & Saldos Separados */}
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

      {/* Modal de Exportação do Relatório Executivo em PDF */}
      <FinancialReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        summary={summary}
        accounts={accounts}
        month={selectedMonth}
        year={selectedYear}
        userName={user?.name || 'Usuário MeuDino'}
        userEmail={user?.email || ''}
      />
    </div>
  );
}
