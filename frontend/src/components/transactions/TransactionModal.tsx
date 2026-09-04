import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  createTransactionRequest,
  updateTransactionRequest,
  createTransferRequest,
  Transaction,
} from '../../api/transactions';
import { getCategoriesRequest, Category } from '../../api/categories';
import { getAccountsRequest, Account } from '../../api/accounts';
import { enqueue } from '../../lib/offlineQueue';
import { useToast } from '../../contexts/ToastContext';
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Calendar,
  Tag,
  DollarSign,
  FileText,
  Landmark,
} from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
}

export function TransactionModal({ isOpen, onClose, onSuccess, transactionToEdit }: TransactionModalProps) {
  const isEditing = !!transactionToEdit;

  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (transactionToEdit) {
        setType(transactionToEdit.type);
        setDescription(transactionToEdit.description);
        setAmount(transactionToEdit.amount.toString());
        setAccountId(transactionToEdit.account_id || '');
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
    setAccountId('');
    setToAccountId('');
    setCategoryId('');
    setDate(new Date().toISOString().split('T')[0]);
    setError(null);
  };

  const loadData = async () => {
    try {
      const [cats, accs] = await Promise.all([
        getCategoriesRequest(),
        getAccountsRequest(),
      ]);
      setCategories(cats);
      setAccounts(accs);

      if (!transactionToEdit && accs.length > 0) {
        const defaultAcc = accs.find((a) => a.is_default) || accs[0];
        setAccountId(defaultAcc.id);
        if (accs.length > 1) {
          const secondAcc = accs.find((a) => a.id !== defaultAcc.id) || accs[1];
          setToAccountId(secondAcc.id);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do formulário:', err);
    }
  };

  const filteredCategories = categories.filter((c) => c.type === (type === 'TRANSFER' ? 'EXPENSE' : type));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor válido e positivo.');
      return;
    }

    if (type === 'TRANSFER') {
      if (!accountId || !toAccountId) {
        setError('Selecione as contas de origem e destino.');
        return;
      }
      if (accountId === toAccountId) {
        setError('A conta de origem e destino não podem ser as mesmas.');
        return;
      }

      setIsLoading(true);
      try {
        await createTransferRequest({
          from_account_id: accountId,
          to_account_id: toAccountId,
          amount: parsedAmount,
          description: description.trim() || undefined,
          date,
        });

        toast.success('Transferência realizada!', 'Saldo transferido entre as contas com sucesso.');
        onSuccess();
        onClose();
        return;
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Erro ao realizar transferência.');
        setIsLoading(false);
        return;
      }
    }

    if (!description.trim()) {
      setError('A descrição é obrigatória.');
      return;
    }

    setIsLoading(true);

    const payload = {
      description: description.trim(),
      amount: parsedAmount,
      type,
      account_id: accountId || null,
      category_id: categoryId || null,
      date,
    };

    // Se estiver explicitamente offline, enfileira diretamente
    if (!navigator.onLine) {
      try {
        if (isEditing && transactionToEdit) {
          await enqueue({
            type: 'UPDATE_TRANSACTION',
            payload: { id: transactionToEdit.id, ...payload },
          });
        } else {
          await enqueue({
            type: 'CREATE_TRANSACTION',
            payload,
          });
        }
        toast.info(
          '💾 Salvo Offline',
          'Sua transação foi salva localmente e será enviada quando reconectar.'
        );
        onSuccess();
        onClose();
        return;
      } catch (err) {
        console.error('Erro ao salvar offline:', err);
        setError('Não foi possível salvar offline.');
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isEditing && transactionToEdit) {
        await updateTransactionRequest(transactionToEdit.id, payload);
      } else {
        await createTransactionRequest(payload);
      }

      toast.success(
        isEditing ? 'Transação atualizada' : 'Transação adicionada',
        'Operação realizada com sucesso.'
      );
      onSuccess();
      onClose();
    } catch (err: any) {
      // Se a requisição falhou por perda de rede durante o envio
      if (err?.code === 'ERR_NETWORK' || !err?.response) {
        try {
          if (isEditing && transactionToEdit) {
            await enqueue({
              type: 'UPDATE_TRANSACTION',
              payload: { id: transactionToEdit.id, ...payload },
            });
          } else {
            await enqueue({
              type: 'CREATE_TRANSACTION',
              payload,
            });
          }
          toast.warning(
            '💾 Sem conexão — Salvo Offline',
            'Transação salva localmente. Sincronização automática assim que voltar a internet.'
          );
          onSuccess();
          onClose();
          return;
        } catch {
          // fallback caso falhe indexedDB
        }
      }
      setError(err?.response?.data?.message || 'Ocorreu um erro ao salvar a transação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Transação' : type === 'TRANSFER' ? 'Transferência entre Contas' : 'Nova Transação'}
      description={
        isEditing
          ? 'Atualize os dados do lançamento financeiro'
          : type === 'TRANSFER'
          ? 'Movimente recursos financeiros entre suas contas bancárias'
          : 'Adicione uma nova receita ou despesa manual à sua conta'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Toggle Tipo: Despesa vs Receita vs Transferência */}
        {!isEditing && (
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-card-secondary border border-border min-h-[44px]">
            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategoryId('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                type === 'EXPENSE'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-din-muted hover:text-din-text'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Despesa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                setCategoryId('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                type === 'INCOME'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-din-muted hover:text-din-text'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Receita</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('TRANSFER');
                setCategoryId('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
                type === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'text-din-muted hover:text-din-text'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transferir</span>
            </button>
          </div>
        )}

        {/* Descrição */}
        <Input
          label={type === 'TRANSFER' ? 'Descrição da Transferência (Opcional)' : 'Descrição'}
          placeholder={
            type === 'TRANSFER'
              ? 'Ex: Transferência para Poupança, Reserva...'
              : 'Ex: Almoço no Restaurante, Salário, Uber...'
          }
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          icon={<FileText className="w-4 h-4" />}
          required={type !== 'TRANSFER'}
          className="h-11 text-sm"
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
            className="h-11 text-sm"
          />

          {/* Data */}
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
            required
            className="h-11 text-sm"
          />
        </div>

        {/* Seleção de Contas */}
        {type === 'TRANSFER' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Conta de Origem */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
                Debitar de (Origem)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-din-muted">
                  <Landmark className="w-4 h-4" />
                </div>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full rounded-xl bg-card border border-border text-din-text text-sm pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Conta de Destino */}
            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
                Creditar em (Destino)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-din-muted">
                  <Landmark className="w-4 h-4" />
                </div>
                <select
                  value={toAccountId}
                  onChange={(e) => setToAccountId(e.target.value)}
                  className="w-full rounded-xl bg-card border border-border text-din-text text-sm pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          /* Conta Bancária Única */
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
              Conta Bancária / Carteira
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-din-muted">
                <Landmark className="w-4 h-4" />
              </div>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full rounded-xl bg-card border border-border text-din-text text-sm pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} {acc.is_default ? '(Padrão)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Categoria (apenas para Receita / Despesa) */}
        {type !== 'TRANSFER' && (
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
              Categoria
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-din-muted">
                <Tag className="w-4 h-4" />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl bg-card border border-border text-din-text text-sm pl-10 pr-3.5 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
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
        )}

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="min-h-[44px]">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={type === 'EXPENSE' ? 'danger' : type === 'INCOME' ? 'emerald' : 'primary'}
            isLoading={isLoading}
            className="min-h-[44px] px-6"
          >
            {isEditing
              ? 'Salvar Alterações'
              : type === 'TRANSFER'
              ? 'Realizar Transferência'
              : 'Adicionar Transação'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
