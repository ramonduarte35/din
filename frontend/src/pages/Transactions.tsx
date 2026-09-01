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
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useLayout } from '../components/layout/AppLayout';

export function Transactions() {
  const { openNewTransactionModal, refreshKey, triggerRefresh } = useLayout();

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

  // Modal de Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await getTransactionsRequest(filters);
      setTransactions(data.transactions);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Erro ao carregar transações:', err);
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

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      await deleteTransactionRequest(deletingId);
      setDeletingId(null);
      triggerRefresh();
      loadTransactions();
    } catch (err) {
      console.error('Erro ao excluir transação:', err);
    } finally {
      setIsDeleting(false);
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
          className="self-start sm:self-auto h-9"
        >
          <Plus className="w-4 h-4 mr-1" />
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
        onDelete={(id) => setDeletingId(id)}
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

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title="Excluir Lançamento"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita e afetará o saldo total.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeletingId(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Excluir Definitivamente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
