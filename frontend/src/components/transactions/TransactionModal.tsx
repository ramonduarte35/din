import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { createTransactionRequest, updateTransactionRequest, Transaction } from '../../api/transactions';
import { getCategoriesRequest, Category } from '../../api/categories';
import { TrendingUp, TrendingDown, Calendar, Tag, DollarSign, FileText } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onSuccess, transactionToEdit }: TransactionModalProps) {
  const isEditing = !!transactionToEdit;

  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setDescription(transactionToEdit.description);
        setAmount(transactionToEdit.amount.toString());
        setCategoryId(transactionToEdit.category_id || '');
        setDate(new Date(transactionToEdit.date).toISOString().split('T')[0]);
      } else {
        resetForm();
      }
    }
  }, [isOpen, transactionToEdit]);

  const resetForm = () => {
    setType('EXPENSE');
    setDescription('');
    setAmount('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);
  };

  const loadCategories = async () => {
    try {
      const data = await getCategoriesRequest();
      setCategories(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor válido e positivo.');
      return;
    }

    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && transactionToEdit) {
        await updateTransactionRequest(transactionToEdit.id, {
          description: description.trim(),
          amount: parsedAmount,
          type,
          category_id: categoryId || null,
          date,
        });
      } else {
        await createTransactionRequest({
          description: description.trim(),
          amount: parsedAmount,
          type,
          category_id: categoryId || null,
          date,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Ocorreu um erro ao salvar a transação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : 'Nova Transação'}
      description={
        isEditing
          ? 'Atualize os dados do lançamento financeiro'
          : 'Adicione uma nova receita ou despesa manual à sua conta'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Tipo: Despesa vs Receita */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              setCategoryId('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              setCategoryId('');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
              type === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Receita</span>
          </button>
        </div>

        {/* Descrição */}
        <Input
          label="Descrição"
          placeholder="Ex: Almoço no Restaurante, Salário, Uber..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          icon={<FileText className="w-4 h-4" />}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Valor */}
          <Input
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
            required
          />

          {/* Data */}
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
            required
          />
        </div>

        {/* Categoria */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
            Categoria
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Tag className="w-4 h-4" />
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 text-sm pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
            >
              <option value="">Selecione uma categoria (opcional)</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={type === 'EXPENSE' ? 'danger' : 'emerald'}
            isLoading={isLoading}
          >
            {isEditing ? 'Salvar Alterações' : 'Adicionar Transação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
