import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Category, createCategoryRequest, updateCategoryRequest } from '../../api/categories';
import { useToast } from '../../contexts/ToastContext';
import {
  Tag,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Utensils,
  Car,
  Home,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Briefcase,
  Plane,
  Smartphone,
  Film,
  Gift,
  Shield,
  Coffee,
  Zap,
  PiggyBank,
  Check,
} from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: Category | null;
}

const AVAILABLE_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#64748b', // slate
  '#0284c7', // sky
];

const AVAILABLE_ICONS = [
  { name: 'Tag', icon: Tag },
  { name: 'Utensils', icon: Utensils },
  { name: 'ShoppingBag', icon: ShoppingBag },
  { name: 'Car', icon: Car },
  { name: 'Home', icon: Home },
  { name: 'HeartPulse', icon: HeartPulse },
  { name: 'GraduationCap', icon: GraduationCap },
  { name: 'DollarSign', icon: DollarSign },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Plane', icon: Plane },
  { name: 'Smartphone', icon: Smartphone },
  { name: 'Film', icon: Film },
  { name: 'Gift', icon: Gift },
  { name: 'Coffee', icon: Coffee },
  { name: 'Zap', icon: Zap },
  { name: 'PiggyBank', icon: PiggyBank },
];

export function CategoryModal({ isOpen, onClose, onSuccess, categoryToEdit }: CategoryModalProps) {
  const isEditing = !!categoryToEdit;
  const toast = useToast();

  const [name, setName] = useState('');
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [color, setColor] = useState('#10b981');
  const [icon, setIcon] = useState('Tag');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setType(categoryToEdit.type);
        setColor(categoryToEdit.color || '#10b981');
        setIcon(categoryToEdit.icon || 'Tag');
      } else {
        setName('');
        setType('EXPENSE');
        setColor('#ef4444');
        setIcon('Tag');
      }
      setError(null);
    }
  }, [isOpen, categoryToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isEditing && categoryToEdit) {
        await updateCategoryRequest(categoryToEdit.id, {
          name: name.trim(),
          type,
          color,
          icon,
        });
        toast.success('Categoria atualizada com sucesso!');
      } else {
        await createCategoryRequest({
          name: name.trim(),
          type,
          color,
          icon,
        });
        toast.success('Categoria criada com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao salvar categoria.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Categoria' : 'Nova Categoria'}
      description={
        isEditing
          ? 'Atualize as informações da sua categoria personalizada'
          : 'Crie uma nova categoria personalizada para classificar suas transações'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* Toggle Tipo: Despesa vs Receita */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-card-secondary border border-border min-h-[44px]">
          <button
            type="button"
            onClick={() => {
              setType('EXPENSE');
              if (!isEditing) setColor('#ef4444');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
              type === 'EXPENSE'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                : 'text-din-muted hover:text-din-text'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            <span>Despesa</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setType('INCOME');
              if (!isEditing) setColor('#10b981');
            }}
            className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all min-h-[44px] ${
              type === 'INCOME'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                : 'text-din-muted hover:text-din-text'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Receita</span>
          </button>
        </div>

        {/* Nome */}
        <Input
          label="Nome da Categoria"
          placeholder="Ex: Assinaturas, Freelance, Pets, Farmácia..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<Tag className="w-4 h-4" />}
          required
          className="h-11 text-sm"
        />

        {/* Paleta de Cores */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
            Cor da Categoria
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

        {/* Seletor de Ícones */}
        <div className="space-y-1.5 text-left">
          <label className="block text-xs font-semibold text-din-text uppercase tracking-wide">
            Ícone
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2.5 rounded-2xl bg-card-secondary border border-border">
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

        {/* Preview do Card */}
        <div className="p-3.5 rounded-2xl bg-card-secondary border border-border flex items-center justify-between">
          <span className="text-xs text-din-muted font-medium">Prévia:</span>
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-din-text">{name.trim() || 'Nova Categoria'}</p>
              <p className="text-[10px] text-din-muted">{type === 'EXPENSE' ? 'Despesa' : 'Receita'}</p>
            </div>
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
            {isEditing ? 'Salvar Alterações' : 'Criar Categoria'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
