import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Goal, depositGoalRequest } from '../../api/goals';
import { useToast } from '../../contexts/ToastContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { DollarSign, PiggyBank, Plus } from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: Goal | null;
}

export function DepositModal({ isOpen, onClose, onSuccess, goal }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toast = useToast();
  const { maskValue } = usePrivacy();

  if (!goal) return null;

  const handleQuickAdd = (value: number) => {
    setAmount(value.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(',', '.'));

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Informe um valor de aporte positivo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await depositGoalRequest(goal.id, parsedAmount);
      toast.success(
        'Aporte registrado! 🎉',
        `Você guardou ${maskValue(parsedAmount)} na meta "${goal.title}".`
      );
      setAmount('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao realizar aporte.');
    } finally {
      setIsLoading(false);
    }
  };

  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Guardar Dinheiro: ${goal.title}`}
      description={`Adicione um aporte financeiro à sua meta. Faltam ${maskValue(remaining)} para atingir o objetivo.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Quick Chips */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-din-muted uppercase tracking-wide">
            Valores Rápidos
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[20, 50, 100, 200].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAdd(val)}
                className="py-2 px-3 rounded-xl bg-card-secondary hover:bg-card-hover border border-border text-xs font-bold text-din-text hover:text-emerald-400 transition-all min-h-[40px]"
              >
                +{maskValue(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Input de Valor Customizado */}
        <Input
          label="Valor do Aporte (R$)"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          icon={<DollarSign className="w-4 h-4" />}
          required
          className="h-12 text-base font-bold font-mono"
        />

        {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className="min-h-[44px]">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="emerald"
            isLoading={isLoading}
            className="min-h-[44px] px-6"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Confirmar Aporte
          </Button>
        </div>
      </form>
    </Modal>
  );
}
