import React, { useState, useEffect } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { FinancialHealthWidget } from '../components/dashboard/FinancialHealthWidget';
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
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, Calendar, FileText } from 'lucide-react';
import { Button } from '../components/ui/Button';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const loadData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

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
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [refreshKey, selectedMonth, selectedYear]);

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

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {/* Navegação de Período */}
          <div className="flex items-center gap-1 bg-card-secondary border border-border rounded-xl p-1">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg hover:bg-card-hover text-din-muted hover:text-din-text transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={!isCurrentMonth ? handleGoToCurrentMonth : undefined}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-din-text min-w-[130px] justify-center"
              title={!isCurrentMonth ? 'Clique para ir ao mês atual' : undefined}
            >
              <Calendar className="w-3.5 h-3.5 text-din-primary" />
              <span>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</span>
            </button>

            <button
              onClick={handleNextMonth}
              disabled={isCurrentMonth}
              className="p-1.5 rounded-lg hover:bg-card-hover text-din-muted hover:text-din-text transition-colors disabled:opacity-30 disabled:cursor-not-allowed min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="h-9 min-h-[44px] text-xs px-3 border-border hover:border-din-primary/40 text-din-text hover:text-din-primary"
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
            className="h-9 min-h-[44px] text-xs px-3"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* 1. Cards de Resumo / KPIs Gerais */}
      <SummaryCards summary={summary} isLoading={isLoading} />

      {/* 2. Score de Saúde Financeira com IA */}
      <FinancialHealthWidget summary={summary} isLoading={isLoading} />

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
        userName={user?.name || 'Usuário Din'}
        userEmail={user?.email || ''}
      />
    </div>
  );
}
