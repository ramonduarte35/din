import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Button } from '../ui/Button';
import {
  BudgetItem,
  BudgetCategory,
  upsertBudgetRequest,
  updateBudgetRequest,
} from '../../api/budgets';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrencyInput, parseCurrencyInput } from '../../lib/utils';
import { DollarSign, Tag, Layers, Calendar } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToEdit?: BudgetItem | null;
  availableCategories: BudgetCategory[];
  currentMonth: number;
  currentYear: number;
  preselectedCategoryId?: string;
}

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  budgetToEdit,
  availableCategories,
  currentMonth,
  currentYear,
  preselectedCategoryId,
}: BudgetModalProps) {
  const isEditing = !!budgetToEdit;
  const toast = useToast();

  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (budgetToEdit) {
        setCategoryId(budgetToEdit.category_id);
        setAmount(formatCurrencyInput(budgetToEdit.budgeted_amount));
      } else {
        setCategoryId(preselectedCategoryId || (availableCategories.length > 0 ? availableCategories[0].id : ''));
        setAmount('');
      }
    }
  }, [isOpen, budgetToEdit, availableCategories, preselectedCategoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericAmount = parseCurrencyInput(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError('Informe um valor de orçamento maior que zero.');
      return;
    }

    if (!isEditing && !categoryId) {
      setError('Selecione uma categoria para definir o orçamento.');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && budgetToEdit) {
        await updateBudgetRequest(budgetToEdit.id, numericAmount);
        toast.success('Orçamento atualizado com sucesso!');
      } else {
        await upsertBudgetRequest({
          category_id: categoryId,
          amount: numericAmount,
          month: currentMonth,
          year: currentYear,
        });
        toast.success('Orçamento definido com sucesso!');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar orçamento:', err);
      const msg = err.response?.data?.message || err.message || 'Erro ao salvar orçamento.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonthName = MONTH_NAMES[currentMonth - 1] || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Orçamento' : 'Definir Teto de Gastos'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-500">
            {error}
          </div>
        )}

        {/* Período de Referência */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-din-muted">
            <Calendar className="w-4 h-4 text-din-primary" />
            <span>Mês de Referência</span>
          </div>
          <span className="text-xs font-bold text-din-text px-2.5 py-1 rounded-lg bg-background border border-border">
            {currentMonthName} de {currentYear}
          </span>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-xs font-semibold text-din-muted mb-1.5">
            Categoria de Despesa <span className="text-rose-500">*</span>
          </label>
          {isEditing ? (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                style={{ backgroundColor: budgetToEdit?.category.color || '#64748b' }}
              >
                <Tag className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-din-text">{budgetToEdit?.category.name}</span>
            </div>
          ) : (
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isLoading || availableCategories.length === 0}
                className="w-full h-11 px-3.5 rounded-xl bg-background border border-border text-din-text text-sm font-medium focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary transition-all disabled:opacity-50 appearance-none"
              >
                {availableCategories.length === 0 ? (
                  <option value="">Todas as categorias já possuem orçamento</option>
                ) : (
                  availableCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-din-muted">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>

        {/* Valor Limite (Teto) */}
        <div>
          <CurrencyInput
            label="Teto Limite Mensal (R$)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onValueChange={(_num, formatted) => setAmount(formatted)}
            placeholder="0,00"
            disabled={isLoading}
            icon={<DollarSign className="w-4 h-4" />}
            hint="Defina o valor máximo que você planeja gastar nesta categoria neste mês."
            autoFocus
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            disabled={isLoading || (!isEditing && availableCategories.length === 0)}
            className="min-h-[44px]"
          >
            {isEditing ? 'Salvar Alterações' : 'Definir Orçamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
