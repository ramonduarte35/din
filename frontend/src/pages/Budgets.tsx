import React, { useState, useEffect } from 'react';
import {
  BudgetItem,
  BudgetCategory,
  BudgetSummary,
  getBudgetsRequest,
  deleteBudgetRequest,
  copyPreviousBudgetsRequest,
} from '../api/budgets';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { TableSkeleton } from '../components/ui/Skeleton';
import { BudgetModal } from '../components/budgets/BudgetModal';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { formatBRL, MONTH_NAMES } from '../lib/utils';
import {
  PieChart,
  Plus,
  ChevronLeft,
  ChevronRight,
  Copy,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  TrendingDown,
  Tag,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  DollarSign,
  ArrowUpRight,
  Zap,
} from 'lucide-react';

export function Budgets() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [availableCategories, setAvailableCategories] = useState<BudgetCategory[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WARNING_OR_EXCEEDED' | 'NORMAL'>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>(undefined);

  const confirm = useConfirm();
  const toast = useToast();
  const { isPrivate } = usePrivacy();

  const loadBudgets = async (month: number, year: number) => {
    setIsLoading(true);
    try {
      const data = await getBudgetsRequest(month, year);
      setBudgets(data.budgets);
      setAvailableCategories(data.available_categories);
      setSummary(data.summary);
    } catch (err: any) {
      console.error('Erro ao carregar orçamentos:', err);
      toast.error('Não foi possível carregar os orçamentos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleCurrentMonth = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  };

  const handleOpenCreate = (categoryId?: string) => {
    setEditingBudget(null);
    setPreselectedCategoryId(categoryId);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BudgetItem) => {
    setEditingBudget(b);
    setPreselectedCategoryId(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (b: BudgetItem) => {
    const ok = await confirm({
      title: 'Remover Orçamento',
      message: `Deseja remover o teto de gastos para a categoria "${b.category.name}" em ${MONTH_NAMES[selectedMonth - 1]} de ${selectedYear}?`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await deleteBudgetRequest(b.id);
      toast.success('Orçamento removido com sucesso.');
      loadBudgets(selectedMonth, selectedYear);
    } catch (err: any) {
      console.error('Erro ao excluir orçamento:', err);
      toast.error('Erro ao remover orçamento.');
    }
  };

  const handleCopyPreviousMonth = async () => {
    const prevM = selectedMonth === 1 ? 12 : selectedMonth - 1;
    const prevY = selectedMonth === 1 ? selectedYear - 1 : selectedYear;

    const ok = await confirm({
      title: 'Copiar Orçamentos',
      message: `Deseja importar todos os limites definidos no mês anterior (${MONTH_NAMES[prevM - 1]} de ${prevY}) para ${MONTH_NAMES[selectedMonth - 1]} de ${selectedYear}?`,
      confirmText: 'Copiar Agora',
      cancelText: 'Cancelar',
      variant: 'info',
    });

    if (!ok) return;

    setIsCopying(true);
    try {
      const res = await copyPreviousBudgetsRequest({
        target_month: selectedMonth,
        target_year: selectedYear,
      });
      toast.success(`${res.copied_count} orçamento(s) importado(s) com sucesso!`);
      loadBudgets(selectedMonth, selectedYear);
    } catch (err: any) {
      console.error('Erro ao copiar orçamentos:', err);
      toast.error(err.response?.data?.message || 'Erro ao copiar orçamentos do mês anterior.');
    } finally {
      setIsCopying(false);
    }
  };

  const isCurrentMonth =
    selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear();

  const filteredBudgets = budgets.filter((b) => {
    if (filterStatus === 'WARNING_OR_EXCEEDED') {
      return b.status === 'WARNING' || b.status === 'DANGER' || b.status === 'EXCEEDED';
    }
    if (filterStatus === 'NORMAL') {
      return b.status === 'NORMAL';
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header com Título e Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-din-text">
              Orçamentos Mensais
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-din-primary/10 text-din-primary border border-din-primary/20">
              Tetos de Gastos
            </span>
          </div>
          <p className="text-sm text-din-muted mt-1">
            Defina limites por categoria e controle suas despesas em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {budgets.length === 0 && (
            <Button
              variant="outline"
              onClick={handleCopyPreviousMonth}
              isLoading={isCopying}
              className="min-h-[44px] text-xs sm:text-sm font-semibold"
            >
              <Copy className="w-4 h-4 mr-1.5 text-din-primary" />
              Copiar Mês Anterior
            </Button>
          )}

          <Button
            variant="primary"
            onClick={() => handleOpenCreate()}
            className="min-h-[44px] font-bold shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Novo Teto
          </Button>
        </div>
      </div>

      {/* Navegador de Mês / Ano */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border shadow-sm">
        <Button
          variant="ghost"
          onClick={handlePrevMonth}
          aria-label="Mês Anterior"
          className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-din-muted hover:text-din-text"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-base sm:text-lg text-din-text">
            <Calendar className="w-5 h-5 text-din-primary" />
            <span>
              {MONTH_NAMES[selectedMonth - 1]} de {selectedYear}
            </span>
          </div>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleCurrentMonth}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-din-primary/10 text-din-primary border border-din-primary/20 hover:bg-din-primary/20 transition-all min-h-[32px] touch-manipulation"
            >
              Mês Atual
            </button>
          )}
        </div>

        <Button
          variant="ghost"
          onClick={handleNextMonth}
          aria-label="Próximo Mês"
          className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-din-muted hover:text-din-text"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <TableSkeleton rows={4} />
      ) : (
        <>
          {/* Card Resumo Geral do Mês */}
          {summary && (
            <Card className="relative overflow-hidden p-5 sm:p-6 bg-gradient-to-br from-card to-card-hover border-border shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Lado Esquerdo: Estatísticas Principais */}
                <div className="space-y-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-din-primary/15 text-din-primary flex items-center justify-center">
                        <PieChart className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-din-muted">
                        Balanço do Orçamento
                      </span>
                    </div>

                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-full border ${
                        summary.overall_percentage > 100
                          ? 'bg-rose-500/15 text-rose-500 border-rose-500/30 animate-pulse'
                          : summary.overall_percentage >= 90
                          ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                      }`}
                    >
                      {summary.overall_percentage}% do Teto Consumido
                    </span>
                  </div>

                  {/* Barra de Progresso Geral */}
                  <div className="space-y-1.5">
                    <div className="w-full h-3.5 bg-background rounded-full overflow-hidden p-0.5 border border-border">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          summary.overall_percentage > 100
                            ? 'bg-gradient-to-r from-rose-500 to-red-600'
                            : summary.overall_percentage >= 90
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${Math.min(100, summary.overall_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Valores Resumo */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-background/60 border border-border/80">
                      <span className="text-[11px] font-semibold text-din-muted block mb-0.5">
                        Total Orçado
                      </span>
                      <span className="text-sm sm:text-base font-black text-din-text">
                        {isPrivate ? '••••••' : formatBRL(summary.total_budgeted)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-background/60 border border-border/80">
                      <span className="text-[11px] font-semibold text-din-muted block mb-0.5">
                        Total Gasto
                      </span>
                      <span className="text-sm sm:text-base font-black text-rose-500">
                        {isPrivate ? '••••••' : formatBRL(summary.total_spent)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-background/60 border border-border/80">
                      <span className="text-[11px] font-semibold text-din-muted block mb-0.5">
                        {summary.total_remaining >= 0 ? 'Saldo Restante' : 'Excedente'}
                      </span>
                      <span
                        className={`text-sm sm:text-base font-black ${
                          summary.total_remaining >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {isPrivate ? '••••••' : formatBRL(Math.abs(summary.total_remaining))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Filtros de Status (se houver orçamentos) */}
          {budgets.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-manipulation whitespace-nowrap ${
                  filterStatus === 'ALL'
                    ? 'bg-din-primary text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-card border border-border text-din-muted hover:text-din-text'
                }`}
              >
                Todas ({budgets.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('WARNING_OR_EXCEEDED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-manipulation whitespace-nowrap flex items-center gap-1.5 ${
                  filterStatus === 'WARNING_OR_EXCEEDED'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'bg-card border border-border text-din-muted hover:text-din-text'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Alerta / Estouradas (
                {
                  budgets.filter(
                    (b) => b.status === 'WARNING' || b.status === 'DANGER' || b.status === 'EXCEEDED'
                  ).length
                }
                )
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('NORMAL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[44px] touch-manipulation whitespace-nowrap ${
                  filterStatus === 'NORMAL'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-card border border-border text-din-muted hover:text-din-text'
                }`}
              >
                Dentro do Teto ({budgets.filter((b) => b.status === 'NORMAL').length})
              </button>
            </div>
          )}

          {/* Lista de Cards de Orçamento */}
          {filteredBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBudgets.map((b) => {
                const isExceeded = b.status === 'EXCEEDED';
                const isDanger = b.status === 'DANGER';
                const isWarning = b.status === 'WARNING';

                return (
                  <Card
                    key={b.id}
                    className={`p-4 sm:p-5 transition-all duration-200 hover:shadow-md border ${
                      isExceeded
                        ? 'border-rose-500/40 bg-rose-500/5'
                        : isDanger
                        ? 'border-orange-500/30'
                        : isWarning
                        ? 'border-amber-500/30'
                        : 'border-border'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Topo do Card da Categoria */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                            style={{ backgroundColor: b.category.color || '#64748b' }}
                          >
                            <Tag className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-bold text-din-text truncate">
                              {b.category.name}
                            </h3>
                            <span className="text-[11px] text-din-muted">
                              {b.percentage}% do teto utilizado
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              isExceeded
                                ? 'bg-rose-500/15 text-rose-500 border-rose-500/30'
                                : isDanger
                                ? 'bg-orange-500/15 text-orange-500 border-orange-500/30'
                                : isWarning
                                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                                : 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30'
                            }`}
                          >
                            {isExceeded
                              ? 'Estourado'
                              : isDanger
                              ? 'No Limite'
                              : isWarning
                              ? 'Atenção'
                              : 'Normal'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenEdit(b)}
                            aria-label={`Editar orçamento de ${b.category.name}`}
                            className="p-2 rounded-lg text-din-muted hover:text-din-text hover:bg-card-hover min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b)}
                            aria-label={`Excluir orçamento de ${b.category.name}`}
                            className="p-2 rounded-lg text-din-muted hover:text-rose-500 hover:bg-rose-500/10 min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Barra de Progresso da Categoria */}
                      <div className="space-y-1">
                        <div className="w-full h-3 bg-background rounded-full overflow-hidden p-0.5 border border-border">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isExceeded
                                ? 'bg-rose-500'
                                : isDanger
                                ? 'bg-orange-500'
                                : isWarning
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, b.percentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Linha de Valores */}
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                        <div>
                          <span className="text-din-muted block text-[10px]">Gasto Real</span>
                          <span className="font-bold text-din-text">
                            {isPrivate ? '••••••' : formatBRL(b.spent_amount)}
                          </span>
                        </div>

                        <div className="text-center">
                          <span className="text-din-muted block text-[10px]">Teto Orçado</span>
                          <span className="font-bold text-din-text">
                            {isPrivate ? '••••••' : formatBRL(b.budgeted_amount)}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-din-muted block text-[10px]">
                            {b.remaining_amount >= 0 ? 'Resta' : 'Excedeu'}
                          </span>
                          <span
                            className={`font-black ${
                              b.remaining_amount >= 0 ? 'text-emerald-500' : 'text-rose-500'
                            }`}
                          >
                            {isPrivate ? '••••••' : formatBRL(Math.abs(b.remaining_amount))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <>
              <EmptyState
                icon={<PieChart className="w-8 h-8" />}
                title={
                  filterStatus !== 'ALL'
                    ? 'Nenhum orçamento neste filtro'
                    : 'Nenhum orçamento definido para este mês'
                }
                description={
                  filterStatus !== 'ALL'
                    ? 'Altere o filtro de visualização para ver outras categorias.'
                    : 'Defina limites mensais para suas categorias de despesa e evite surpresas no final do mês.'
                }
                actionText={filterStatus === 'ALL' ? 'Definir Primeiro Teto' : undefined}
                onAction={filterStatus === 'ALL' ? () => handleOpenCreate() : undefined}
                variant="indigo"
              />
              {filterStatus === 'ALL' && (
                <div className="flex justify-center mt-3">
                  <Button
                    variant="outline"
                    onClick={handleCopyPreviousMonth}
                    isLoading={isCopying}
                    className="min-h-[44px]"
                  >
                    <Copy className="w-4 h-4 mr-1.5 text-din-primary" />
                    Copiar do Mês Anterior
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Categorias sem Orçamento (Atalho Rápido para Adicionar) */}
          {availableCategories.length > 0 && budgets.length > 0 && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-din-primary" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-din-muted">
                  Categorias sem teto definido ({availableCategories.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleOpenCreate(cat.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card border border-border hover:border-din-primary/50 text-xs font-medium text-din-text hover:bg-card-hover transition-all min-h-[44px] touch-manipulation group"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] shrink-0"
                      style={{ backgroundColor: cat.color || '#64748b' }}
                    >
                      •
                    </div>
                    <span>{cat.name}</span>
                    <Plus className="w-3.5 h-3.5 text-din-muted group-hover:text-din-primary ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Criação e Edição */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadBudgets(selectedMonth, selectedYear)}
        budgetToEdit={editingBudget}
        availableCategories={availableCategories}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        preselectedCategoryId={preselectedCategoryId}
      />
    </div>
  );
}
