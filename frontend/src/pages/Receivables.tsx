import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Receivable,
  ReceivableStatus,
  fetchReceivables,
  fetchReceivableSummary,
  deleteReceivable,
  unreceiveReceivable,
} from '../api/receivables';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TableSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { ReceivableModal } from '../components/receivables/ReceivableModal';
import { ReceiveModal } from '../components/receivables/ReceiveModal';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { formatDate, getDiffDays, MONTH_NAMES, toTitleCasePTBR } from '../lib/utils';
import {
  TrendingUp,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Edit2,
  Trash2,
  Calendar,
  Tag,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CalendarDays,
  ContactRound,
  X,
  Banknote,
  CircleDollarSign,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ReceivableStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: 'Pendente',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    icon: <Clock className="w-3 h-3" />,
  },
  RECEIVED: {
    label: 'Recebido',
    color: 'text-teal-400',
    bg: 'bg-teal-500/10 border-teal-500/20',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  OVERDUE: {
    label: 'Em Atraso',
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-foreground/40',
    bg: 'bg-foreground/5 border-foreground/10',
    icon: <X className="w-3 h-3" />,
  },
};

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ─── Component ───────────────────────────────────────────────────────────────

export const Receivables: React.FC = () => {
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentMonthNow = new Date().getMonth() + 1;
  const currentYearNow = new Date().getFullYear();
  const isCurrentMonth = month === currentMonthNow && year === currentYearNow;

  const confirm = useConfirm();
  const toast = useToast();
  const { maskValue } = usePrivacy();

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null);
  const [editReceivable, setEditReceivable] = useState<Receivable | null>(null);

  // Controle de IDs já copiados
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function handlePreviousMonth() {
    if (month === 1) { setMonth(12); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function handleNextMonth() {
    if (month === 12) { setMonth(1); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  const loadData = useCallback(
    async (showLoader = true, bypassCache = false) => {
      if (showLoader) setLoading(true);
      try {
        const params: any = { month, year, limit: 100 };
        if (activeTab !== 'ALL') params.status = activeTab;
        if (search.trim()) params.search = search.trim();
        if (bypassCache) params._t = Date.now();

        const [listResult, summaryResult] = await Promise.all([
          fetchReceivables(params),
          fetchReceivableSummary(month, year),
        ]);

        setReceivables(listResult.receivables);
        setSummary(summaryResult);
      } catch {
        toast.error('Erro ao carregar contas a receber');
      } finally {
        setLoading(false);
      }
    },
    [month, year, activeTab, search]
  );

  useEffect(() => {
    const timer = setTimeout(() => loadData(true), search ? 400 : 0);
    return () => clearTimeout(timer);
  }, [month, year, activeTab, search]);

  async function handleForceRefresh() {
    setIsRefreshing(true);
    try {
      await loadData(false, true);
      toast.success('Dados atualizados!');
    } catch {
      toast.error('Erro ao sincronizar dados.');
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleNewReceivable() {
    setEditReceivable(null);
    setIsModalOpen(true);
  }

  function handleEditReceivable(r: Receivable) {
    setEditReceivable(r);
    setIsModalOpen(true);
  }

  function handleReceive(r: Receivable) {
    setSelectedReceivable(r);
    setIsReceiveModalOpen(true);
  }

  async function handleUnreceive(r: Receivable) {
    const ok = await confirm({
      title: 'Desfazer Recebimento',
      message: `Deseja marcar "${toTitleCasePTBR(r.description)}" como pendente novamente? A transação de receita será removida.`,
      confirmText: 'Desfazer',
    });
    if (!ok) return;
    try {
      await unreceiveReceivable(r.id);
      toast.success('Recebimento desfeito com sucesso!');
      loadData(false);
    } catch {
      toast.error('Erro ao desfazer recebimento');
    }
  }

  async function handleDelete(r: Receivable) {
    const hasGroup = !!r.group_id;
    let scope: 'SINGLE' | 'ALL' = 'SINGLE';

    if (hasGroup) {
      const deleteAll = await confirm({
        title: 'Excluir Parcela(s)',
        message: `"${toTitleCasePTBR(r.description)}" faz parte de um parcelamento. Deseja excluir apenas esta parcela ou todas as pendentes?`,
        confirmText: 'Excluir Todas',
        cancelText: 'Só Esta',
      });
      scope = deleteAll ? 'ALL' : 'SINGLE';
    } else {
      const ok = await confirm({
        title: 'Excluir Conta',
        message: `Excluir "${toTitleCasePTBR(r.description)}"?`,
        confirmText: 'Excluir',
      });
      if (!ok) return;
    }

    try {
      await deleteReceivable(r.id, scope);
      toast.success(scope === 'ALL' ? 'Parcelas excluídas!' : 'Conta excluída com sucesso!');
      loadData(false);
    } catch {
      toast.error('Erro ao excluir conta a receber');
    }
  }

  // Tabs
  const TABS = [
    { id: 'ALL', label: 'Todas' },
    { id: 'PENDING', label: 'Pendentes' },
    { id: 'OVERDUE', label: 'Em Atraso' },
    { id: 'RECEIVED', label: 'Recebido' },
  ];

  const pendingAmount = summary?.total_pending?.amount ?? 0;
  const overdueAmount = summary?.total_overdue?.amount ?? 0;
  const receivedAmount = summary?.total_received?.amount ?? 0;
  const totalExpected = pendingAmount + overdueAmount + receivedAmount;

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Contas a Receber</h1>
            <p className="text-xs text-foreground/50">{MONTH_NAMES[month - 1]} {year}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleForceRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl border border-border/40 bg-card text-foreground/50 hover:text-foreground hover:border-border transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Atualizar"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Button
            onClick={handleNewReceivable}
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center min-h-[44px] bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/20"
          >
            <Plus className="w-4 h-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Navegação de Mês */}
      <div className="flex items-center justify-between bg-card border border-border/40 rounded-2xl p-3">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-xl hover:bg-card-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground/60 hover:text-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-teal-400" />
          <span className="font-semibold text-foreground text-sm">{MONTH_NAMES[month - 1]} {year}</span>
          {!isCurrentMonth && (
            <button
              onClick={() => { setMonth(currentMonthNow); setYear(currentYearNow); }}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium underline underline-offset-2 ml-1"
            >
              Ir para hoje
            </button>
          )}
        </div>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-xl hover:bg-card-hover transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center text-foreground/60 hover:text-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CircleDollarSign className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-medium text-foreground/50">Total Esperado</span>
            </div>
            <div className="text-lg font-bold text-foreground">{maskValue(totalExpected, formatCurrencyBRL(totalExpected))}</div>
            <div className="text-xs text-foreground/40 mt-0.5">{(summary.total_pending.count + summary.total_overdue.count + summary.total_received.count)} conta(s)</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-foreground/50">A Receber</span>
            </div>
            <div className="text-lg font-bold text-amber-400">{maskValue(pendingAmount, formatCurrencyBRL(pendingAmount))}</div>
            <div className="text-xs text-foreground/40 mt-0.5">{summary.total_pending.count} conta(s)</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-foreground/50">Em Atraso</span>
            </div>
            <div className="text-lg font-bold text-red-400">{maskValue(overdueAmount, formatCurrencyBRL(overdueAmount))}</div>
            <div className="text-xs text-foreground/40 mt-0.5">{summary.total_overdue.count} conta(s)</div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-medium text-foreground/50">Recebido</span>
            </div>
            <div className="text-lg font-bold text-teal-400">{maskValue(receivedAmount, formatCurrencyBRL(receivedAmount))}</div>
            <div className="text-xs text-foreground/40 mt-0.5">{summary.total_received.count} conta(s)</div>
          </Card>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="flex flex-col gap-2">
        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-none px-4 py-2 rounded-xl text-sm font-medium border transition-all min-h-[40px] whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-teal-500/15 border-teal-500 text-teal-400'
                  : 'bg-card border-border/40 text-foreground/60 hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conta a receber..."
            className="pl-9 min-h-[44px]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : receivables.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="w-12 h-12 text-foreground/20" />}
          title={search || activeTab !== 'ALL' ? 'Nenhuma conta encontrada' : 'Nenhuma conta a receber este mês'}
          description={
            search || activeTab !== 'ALL'
              ? 'Tente ajustar os filtros.'
              : 'Registre seus recebimentos agendados — aluguéis, serviços, empréstimos, etc.'
          }
          actionText={!search && activeTab === 'ALL' ? 'Adicionar Conta a Receber' : undefined}
          onAction={!search && activeTab === 'ALL' ? handleNewReceivable : undefined}
        />
      ) : (
        <div className="space-y-3">
          {receivables.map((r) => {
            const effectiveStatus = (r.computed_status || r.status) as ReceivableStatus;
            const statusCfg = STATUS_CONFIG[effectiveStatus] ?? STATUS_CONFIG.PENDING;
            const diffDays = getDiffDays(r.due_date);
            const isOverdue = effectiveStatus === 'OVERDUE';
            const isReceived = effectiveStatus === 'RECEIVED';
            const isPending = effectiveStatus === 'PENDING' || effectiveStatus === 'OVERDUE';

            return (
              <Card
                key={r.id}
                className={`p-4 transition-all duration-200 group ${
                  isOverdue ? 'border-red-500/20 hover:border-red-500/40' : 'hover:border-teal-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Status dot */}
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${statusCfg.bg}`}
                  >
                    <span className={statusCfg.color}>{statusCfg.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm leading-tight truncate">
                          {toTitleCasePTBR(r.description)}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          {/* Status badge */}
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}
                          >
                            {statusCfg.icon}
                            {statusCfg.label}
                          </span>

                          {/* Due date */}
                          <span
                            className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-foreground/50'}`}
                          >
                            <Calendar className="w-3 h-3" />
                            {isReceived ? 'Recebido' : 'Vence'} em {formatDate(r.due_date)}
                            {isPending && !isReceived && (
                              <span className={isOverdue ? 'text-red-400 font-medium' : 'text-foreground/40'}>
                                {isOverdue
                                  ? ` (${Math.abs(diffDays)}d atraso)`
                                  : diffDays === 0
                                  ? ' (hoje)'
                                  : ` (em ${diffDays}d)`}
                              </span>
                            )}
                          </span>

                          {/* Contato */}
                          {r.contact && (
                            <span className="text-xs text-foreground/50 flex items-center gap-1">
                              <ContactRound className="w-3 h-3 text-teal-400" />
                              {r.contact.name}
                            </span>
                          )}

                          {/* Categoria */}
                          {r.category && (
                            <span className="text-xs text-foreground/50 flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {r.category.name}
                            </span>
                          )}

                          {/* Parcelamento */}
                          {r.total_installments && r.total_installments > 1 && (
                            <span className="text-[10px] text-foreground/40 bg-card border border-border/40 px-1.5 py-0.5 rounded-full">
                              {r.installment_number}/{r.total_installments}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="text-right shrink-0">
                        <div className={`text-base font-bold ${isReceived ? 'text-teal-400' : isOverdue ? 'text-red-400' : 'text-foreground'}`}>
                          {maskValue(r.amount, formatCurrencyBRL(r.amount))}
                        </div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
                      {isPending && (
                        <button
                          onClick={() => handleReceive(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-teal-500/15 border border-teal-500/30 text-teal-400 hover:bg-teal-500/25 transition-all min-h-[36px]"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          Marcar Recebido
                        </button>
                      )}
                      {isReceived && (
                        <button
                          onClick={() => handleUnreceive(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-card border border-border/40 text-foreground/60 hover:text-amber-400 hover:border-amber-400/30 transition-all min-h-[36px]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          Desfazer
                        </button>
                      )}
                      <div className="ml-auto flex items-center gap-1">
                        <button
                          onClick={() => handleEditReceivable(r)}
                          className="p-2 rounded-xl hover:bg-card-hover transition-colors text-foreground/40 hover:text-blue-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-foreground/40 hover:text-red-400 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <ReceivableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadData(false)}
        receivable={editReceivable}
      />
      <ReceiveModal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        onSuccess={() => loadData(false)}
        receivable={selectedReceivable}
      />
    </div>
  );
};
