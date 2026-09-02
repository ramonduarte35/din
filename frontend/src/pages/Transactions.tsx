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
import { Plus } from 'lucide-react';
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Extrato de Transações
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize, filtre e gerencie todos os seus registros manuais e via WhatsApp
          </p>
        </div>

        <Button
          variant="emerald"
          size="sm"
          onClick={openNewTransactionModal}
          className="self-start sm:self-auto h-10 px-4 min-h-[44px] shadow-lg shadow-emerald-500/20 font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova Transação
        </Button>
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
