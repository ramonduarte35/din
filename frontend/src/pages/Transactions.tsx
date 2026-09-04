import React, { useState, useEffect } from 'react';
import {
  getTransactionsRequest,
  deleteTransactionRequest,
  Transaction,
  TransactionFilters,
} from '../api/transactions';
import { getCategoriesRequest, Category } from '../api/categories';
import { TransactionFiltersBar } from '../components/transactions/TransactionFilters';
import { TransactionTable } from '../components/transactions/TransactionTable';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { Button } from '../components/ui/Button';
import { Plus, Download } from 'lucide-react';
import { useLayout } from '../components/layout/AppLayout';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';

export function Transactions() {
  const { openNewTransactionModal, refreshKey, triggerRefresh } = useLayout();
  const confirm = useConfirm();
  const toast = useToast();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 15,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Modal de Edição
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactionsRequest(filters);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
      toast.error('Erro ao carregar extrato de transações.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCategoriesRequest();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filters, refreshKey]);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 15,
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Excluir Transação',
      message: 'Tem certeza que deseja excluir este lançamento? Esta ação removerá a movimentação do seu saldo e histórico.',
      confirmText: 'Excluir Lançamento',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!ok) return;

    try {
      await deleteTransactionRequest(id);
      toast.success('Transação excluída com sucesso!');
      triggerRefresh();
      loadTransactions();
    } catch (err: any) {
      console.error('Erro ao excluir transação:', err);
      toast.error('Erro ao excluir transação', err?.response?.data?.message);
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      toast.error('Não há transações para exportar com os filtros atuais.');
      return;
    }

    try {
      const headers = ['Data', 'Descrição', 'Tipo', 'Valor (R$)', 'Categoria', 'Conta Bancária', 'Origem'];
      const rows = transactions.map((t) => {
        const originLabel =
          t.origin === 'WHATSAPP_TEXT' ? 'WhatsApp (Texto)'
          : t.origin === 'WHATSAPP_AUDIO' ? 'WhatsApp (Áudio)'
          : t.origin === 'TELEGRAM_TEXT' ? 'Telegram (Texto)'
          : t.origin === 'TELEGRAM_AUDIO' ? 'Telegram (Áudio)'
          : 'Manual';
        return [
          new Date(t.date).toLocaleDateString('pt-BR'),
          `"${(t.description || '').replace(/"/g, '""')}"`,
          t.type === 'INCOME' ? 'Receita' : 'Despesa',
          t.amount.toFixed(2).replace('.', ','),
          `"${t.category?.name || 'Sem Categoria'}"`,
          `"${t.account?.name || 'Conta Principal'}"`,
          originLabel,
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `extrato_din_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Extrato CSV exportado com sucesso!');
    } catch (err) {
      console.error('Erro ao exportar CSV:', err);
      toast.error('Falha ao gerar arquivo CSV.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
            Extrato de Transações
          </h1>
          <p className="text-xs text-din-muted mt-0.5">
            Visualize, filtre e gerencie todos os seus registros manuais e via WhatsApp ou Telegram
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="h-10 px-3.5 min-h-[44px] text-xs font-semibold"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-300" />
            Exportar CSV
          </Button>

          <Button
            variant="emerald"
            size="sm"
            onClick={openNewTransactionModal}
            className="h-10 px-4 min-h-[44px] shadow-lg shadow-emerald-500/20 font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Barra de Filtros */}
      <TransactionFiltersBar
        filters={filters}
        categories={categories}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Tabela de Transações */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={(tx) => setEditingTransaction(tx)}
        onDelete={handleDelete}
        onNewTransaction={openNewTransactionModal}
      />

      {/* Modal de Edição */}
      <TransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transactionToEdit={editingTransaction}
        onSuccess={() => {
          triggerRefresh();
          loadTransactions();
        }}
      />
    </div>
  );
}

