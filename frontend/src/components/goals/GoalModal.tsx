import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Goal, createGoalRequest, updateGoalRequest } from '../../api/goals';
import { useToast } from '../../contexts/ToastContext';
import {
  Target,
  PiggyBank,
  Car,
  Home,
  Plane,
  HeartPulse,
  GraduationCap,
  Trophy,
  Smartphone,
  Sparkles,
  Gem,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalToEdit?: Goal | null;
}

const AVAILABLE_COLORS = [
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#f97316', // orange
  '#14b8a6', // teal
];

const AVAILABLE_ICONS = [
  { name: 'Target', icon: Target },
  { name: 'PiggyBank', icon: PiggyBank },
  { name: 'Plane', icon: Plane },
  { name: 'Car', icon: Car },
  { name: 'Home', icon: Home },
  { name: 'Trophy', icon: Trophy },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'Gem', icon: Gem },
  { name: 'Sparkles', icon: Sparkles },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'HeartPulse', icon: HeartPulse },
];

export function GoalModal({ isOpen, onClose, onSuccess, goalToEdit }: GoalModalProps) {
  const isEditing = !!goalToEdit;
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('Target');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        setTitle(goalToEdit.title);
        setTargetAmount(goalToEdit.target_amount.toString());
        setCurrentAmount(goalToEdit.current_amount.toString());
        setDeadline(goalToEdit.deadline ? new Date(goalToEdit.deadline).toISOString().split('T')[0] : '');
        setColor(goalToEdit.color || '#10b981');
        setIcon(goalToEdit.icon || 'Target');
      } else {
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadline('');
        setColor('#10b981');
        setIcon('Target');
      }
      setError(null);
    }
  }, [isOpen, goalToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount.replace(',', '.'));
    const parsedCurrent = parseFloat(currentAmount.replace(',', '.') || '0');

    if (!title.trim()) {
      setError('O título da meta é obrigatório.');
      return;
    }

    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('Informe um valor alvo válido e positivo.');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && goalToEdit) {
        await updateGoalRequest(goalToEdit.id, {
          title: title.trim(),
          target_amount: parsedTarget,
          current_amount: parsedCurrent,
          deadline: deadline || null,
          color,
          icon,
        });
        toast.success('Meta atualizada com sucesso!');
      } else {
        await createGoalRequest({
          title: title.trim(),
          target_amount: parsedTarget,
          current_amount: parsedCurrent,
          deadline: deadline || null,
          color,
          icon,
        });
        toast.success('Meta financeira criada com sucesso! 🎯');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar meta financeira.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Meta Financeira' : 'Nova Meta Financeira'}
      description={
        isEditing
          ? 'Atualize os dados e objetivo do seu cofrinho'
          : 'Defina um objetivo financeiro para acompanhar seu progresso e economizar'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Título */}
        <Input
          label="Título da Meta"
          placeholder="Ex: Reserva de Emergência, Viagem para Praia, Carro Novo..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          icon={<Target className="w-4 h-4" />}
          required
          className="h-11 text-sm"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Valor Alvo */}
          <Input
            label="Valor Alvo (R$)"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0,00"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            icon={<DollarSign className="w-4 h-4" />}
            required
            className="h-11 text-sm"
          />

          {/* Valor Inicial Guardado */}
          <Input
            label="Valor Atual Guardado (R$)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            icon={<PiggyBank className="w-4 h-4" />}
            className="h-11 text-sm"
          />
        </div>

        {/* Data Limite (Opcional) */}
        <Input
          label="Data Limite / Prazo (Opcional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          icon={<Calendar className="w-4 h-4" />}
          className="h-11 text-sm"
        />

        {/* Paleta de Cores */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
            Cor do Cofrinho
          </label>
          <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-2xl bg-card-secondary border border-border">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform hover:scale-110 shadow-md min-h-[32px] min-w-[32px]"
                style={{ backgroundColor: c }}
              >
                {color === c && <Check className="w-4 h-4 text-white drop-shadow-md" />}
              </button>
            ))}
          </div>
        </div>

        {/* Ícone */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
            Ícone
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-2.5 rounded-2xl bg-card-secondary border border-border">
            {AVAILABLE_ICONS.map(({ name: iconName, icon: IconComponent }) => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all min-h-[44px] ${
                  icon === iconName
                    ? 'bg-din-primary text-white shadow-md shadow-din-primary/30'
                    : 'bg-card text-din-muted hover:text-din-text hover:bg-card-hover border border-border'
                }`}
              >
                <IconComponent className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

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
            {isEditing ? 'Salvar Alterações' : 'Criar Meta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
