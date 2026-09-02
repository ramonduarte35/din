import React, { useState, useEffect } from 'react';
import {
  Bill,
  BillStatus,
  fetchBills,
  fetchBillSummary,
  deleteBill,
  unpayBill,
} from '../api/bills';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { BillModal } from '../components/bills/BillModal';
import { PayBillModal } from '../components/bills/PayBillModal';
import {
  CalendarClock,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  RotateCcw,
  Edit2,
  Trash2,
  Copy,
  Check,
  Calendar,
  Landmark,
  Tag,
} from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

export const Bills: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());

  const confirm = useConfirm();
  const toast = useToast();

  // Modais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, search, month, year]);

  async function loadData() {
    setLoading(true);
    try {
      const params: any = { month, year };
      if (search.trim()) params.search = search.trim();
      if (activeTab === 'PAID') params.status = 'PAID';
      else if (activeTab === 'PENDING') params.status = 'PENDING';

      const [billsData, summaryData] = await Promise.all([
        fetchBills(params),
        fetchBillSummary(month, year),
      ]);

      let filteredBills = billsData.bills;
      if (activeTab === 'OVERDUE') {
        filteredBills = filteredBills.filter((b) => b.computed_status === 'OVERDUE');
      }

      setBills(filteredBills);
      setSummary(summaryData);
    } catch (err) {
      console.error('Erro ao carregar contas a pagar:', err);
      toast.error('Erro ao carregar contas a pagar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(bill: Bill) {
    const ok = await confirm({
      title: 'Excluir Conta a Pagar',
      message: `Deseja realmente excluir a conta "${bill.description}"? Esta ação removerá o compromisso financeiro do sistema.`,
      confirmText: 'Excluir Conta',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await deleteBill(bill.id);
      toast.success('Conta excluída com sucesso!');
      loadData();
    } catch (err: any) {
      console.error('Erro ao excluir conta:', err);
      toast.error('Erro ao excluir conta', err?.response?.data?.message);
    }
  }

  async function handleUnpay(bill: Bill) {
    const ok = await confirm({
      title: 'Desfazer Pagamento',
      message: `Deseja desfazer o pagamento da conta "${bill.description}"? O lançamento de despesa vinculado será removido e o saldo da conta recalculado.`,
      confirmText: 'Sim, Desfazer',
      cancelText: 'Cancelar',
      variant: 'warning',
    });

    if (!ok) return;

    try {
      await unpayBill(bill.id);
      toast.success('Pagamento Desfeito', 'A conta voltou ao status pendente e a despesa foi removida.');
      loadData();
    } catch (err: any) {
      console.error('Erro ao desfazer pagamento:', err);
      toast.error('Erro ao desfazer pagamento', err?.response?.data?.message);
    }
  }

  function handleCopyBarcode(bill: Bill) {
    if (bill.barcode) {
      navigator.clipboard.writeText(bill.barcode);
      setCopiedId(bill.id);
      toast.success('Código Copiado!', 'Linha digitável / chave PIX copiada para a área de transferência.');
      setTimeout(() => setCopiedId(null), 2500);
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-12">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Contas a Pagar</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gerencie seus boletos, vencimentos e dê baixa escolhendo a conta bancária de débito.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingBill(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto py-2.5 px-4 min-h-[44px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-medium shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Conta a Pagar</span>
        </Button>
      </div>

      {/* Cards de Métricas / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total a Pagar / Pendente */}
        <Card className="p-4 sm:p-5 border-slate-700/60 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">A Pagar no Mês</span>
            <p className="text-lg sm:text-2xl font-bold text-amber-400 mt-1">
              {formatCurrency(summary?.total_pending?.amount || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {summary?.total_pending?.count || 0} {summary?.total_pending?.count === 1 ? 'conta pendente' : 'contas pendentes'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </Card>

        {/* Total Atrasado / Vencido */}
        <Card className={`p-4 sm:p-5 border-slate-700/60 flex items-center justify-between ${
          (summary?.total_overdue?.count || 0) > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-900/60'
        }`}>
          <div>
            <span className="text-xs text-red-400 font-medium uppercase tracking-wider">Contas Vencidas</span>
            <p className="text-lg sm:text-2xl font-bold text-red-400 mt-1">
              {formatCurrency(summary?.total_overdue?.amount || 0)}
            </p>
            <p className="text-xs text-red-300/70 mt-0.5">
              {summary?.total_overdue?.count || 0} {summary?.total_overdue?.count === 1 ? 'conta atrasada' : 'contas atrasadas'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </Card>

        {/* Total Pago */}
        <Card className="p-4 sm:p-5 border-slate-700/60 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Pago no Mês</span>
            <p className="text-lg sm:text-2xl font-bold text-emerald-400 mt-1">
              {formatCurrency(summary?.total_paid?.amount || 0)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {summary?.total_paid?.count || 0} {summary?.total_paid?.count === 1 ? 'conta liquidada' : 'contas liquidadas'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* Filtros e Abas */}
      <Card className="p-3 sm:p-4 border-slate-700/60 bg-slate-900/60 space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center justify-between">
          {/* Abas Rápidas */}
          <div className="flex items-center overflow-x-auto no-scrollbar space-x-1.5 pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: 'Todas' },
              { key: 'PENDING', label: 'Pendentes' },
              { key: 'OVERDUE', label: 'Vencidas' },
              { key: 'PAID', label: 'Pagas' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all shrink-0 min-h-[40px] ${
                  activeTab === tab.key
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Busca e Período */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                type="text"
                placeholder="Buscar conta..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 py-2 text-xs sm:text-sm h-10"
              />
            </div>

            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 min-h-[40px]"
            >
              {[
                'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
              ].map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de Contas (Mobile First Cards) */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-4 border-slate-700/60 bg-slate-900/60 animate-pulse h-24" />
          ))}
        </div>
      ) : bills.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center border-slate-700/60 bg-slate-900/60">
          <CalendarClock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base sm:text-lg font-semibold text-white">Nenhuma conta encontrada</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {activeTab === 'ALL'
              ? 'Você ainda não cadastrou nenhuma conta a pagar para este período.'
              : `Nenhuma conta com status "${activeTab}" encontrada.`}
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 py-2 px-4 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
          >
            Cadastrar Primeira Conta
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {bills.map((bill) => {
            const dueDate = new Date(bill.due_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dueDate.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            const isPaid = bill.status === 'PAID';
            const isOverdue = !isPaid && diffDays < 0;
            const isDueToday = !isPaid && diffDays === 0;

            let badgeText = '';
            let badgeStyle = '';

            if (isPaid) {
              badgeText = 'Pago';
              badgeStyle = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
            } else if (isOverdue) {
              badgeText = `Vencido (${Math.abs(diffDays)}d)`;
              badgeStyle = 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
            } else if (isDueToday) {
              badgeText = 'Vence Hoje!';
              badgeStyle = 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold animate-pulse';
            } else if (diffDays === 1) {
              badgeText = 'Vence Amanhã';
              badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
            } else {
              badgeText = `Vence em ${diffDays} dias`;
              badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
            }

            return (
              <Card
                key={bill.id}
                className={`p-4 border transition-all ${
                  isOverdue
                    ? 'border-red-500/40 bg-gradient-to-r from-red-500/5 via-slate-900/80 to-slate-900/60'
                    : isPaid
                    ? 'border-slate-800/80 bg-slate-900/40 opacity-80'
                    : 'border-slate-700/60 bg-slate-900/70 hover:border-slate-600'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Informações da Conta */}
                  <div className="flex items-start space-x-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white mt-0.5"
                      style={{ backgroundColor: bill.category?.color || '#64748b' }}
                    >
                      <Tag className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-semibold text-white text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">
                          {bill.description}
                        </h4>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${badgeStyle}`}>
                          {badgeText}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
                        </span>

                        {bill.category && (
                          <span className="text-slate-300">
                            🏷️ {bill.category.name}
                          </span>
                        )}

                        {isPaid && bill.account && (
                          <span className="text-emerald-400 flex items-center space-x-1 font-medium">
                            <Landmark className="w-3.5 h-3.5" />
                            <span>Debitado de: {bill.account.name}</span>
                          </span>
                        )}
                      </div>

                      {bill.notes && (
                        <p className="text-xs text-slate-400 italic truncate max-w-md pt-0.5">
                          "{bill.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Valor e Ações */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    {/* Valor da Conta */}
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block sm:hidden">Valor</span>
                      <span className={`text-base sm:text-lg font-bold ${isPaid ? 'text-slate-400 line-through' : 'text-white'}`}>
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex items-center space-x-1.5">
                      {/* Botão de Copiar Código de Barras / PIX */}
                      {bill.barcode && (
                        <button
                          type="button"
                          onClick={() => handleCopyBarcode(bill)}
                          title="Copiar Código de Barras / PIX"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700/60"
                        >
                          {copiedId === bill.id ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* Botão de Pagar ou Desfazer */}
                      {!isPaid ? (
                        <Button
                          onClick={() => setPayingBill(bill)}
                          size="sm"
                          className="py-2 px-3.5 min-h-[40px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-md shadow-emerald-500/20 flex items-center space-x-1.5"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Pagar</span>
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUnpay(bill)}
                          title="Desfazer Pagamento"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700/60"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}

                      {/* Menu de Edição / Exclusão */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBill(bill);
                          setIsModalOpen(true);
                        }}
                        title="Editar Conta"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700/60"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(bill)}
                        title="Excluir Conta"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center border border-slate-700/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(null);
        }}
        onSuccess={loadData}
        bill={editingBill}
      />

      <PayBillModal
        isOpen={Boolean(payingBill)}
        onClose={() => setPayingBill(null)}
        onSuccess={loadData}
        bill={payingBill}
      />
    </div>
  );
};
