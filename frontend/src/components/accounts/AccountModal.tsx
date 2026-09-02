import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import {
  Account,
  AccountType,
  createAccountRequest,
  updateAccountRequest,
} from '../../api/accounts';
import {
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  Building2,
  Check,
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountToEdit?: Account | null;
}

const COLOR_PRESETS = [
  { name: 'Nubank (Roxo)', color: '#8b5cf6' },
  { name: 'Banco do Brasil (Amarelo)', color: '#facc15' },
  { name: 'Itaú (Laranja)', color: '#f97316' },
  { name: 'Inter (Verde Din)', color: '#10b981' },
  { name: 'Bradesco / Santander (Vermelho)', color: '#ef4444' },
  { name: 'Caixa (Azul)', color: '#0284c7' },
  { name: 'C6 / Preto', color: '#334155' },
  { name: 'Dourado / Investimento', color: '#eab308' },
];

const ICON_OPTIONS = [
  { label: 'Banco', icon: Landmark, name: 'Landmark' },
  { label: 'Cartão', icon: CreditCard, name: 'CreditCard' },
  { label: 'Carteira', icon: Wallet, name: 'Wallet' },
  { label: 'Poupança', icon: PiggyBank, name: 'PiggyBank' },
  { label: 'Investimento', icon: TrendingUp, name: 'TrendingUp' },
  { label: 'Moedas', icon: Coins, name: 'Coins' },
  { label: 'Empresa', icon: Building2, name: 'Building2' },
];

const TYPE_OPTIONS: { label: string; value: AccountType }[] = [
  { label: 'Conta Corrente', value: 'CHECKING' },
  { label: 'Poupança', value: 'SAVINGS' },
  { label: 'Investimentos', value: 'INVESTMENT' },
  { label: 'Cartão de Crédito', value: 'CREDIT_CARD' },
  { label: 'Dinheiro / Carteira', value: 'CASH' },
  { label: 'Outro', value: 'OTHER' },
];

export function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  accountToEdit,
}: AccountModalProps) {
  const isEditing = !!accountToEdit;

  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('CHECKING');
  const [color, setColor] = useState('#8b5cf6');
  const [icon, setIcon] = useState('Landmark');
  const [initialBalance, setInitialBalance] = useState('0');
  const [isDefault, setIsDefault] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (accountToEdit) {
        setName(accountToEdit.name);
        setType(accountToEdit.type);
        setColor(accountToEdit.color || '#8b5cf6');
        setIcon(accountToEdit.icon || 'Landmark');
        setInitialBalance(accountToEdit.initial_balance.toString());
        setIsDefault(accountToEdit.is_default);
      } else {
        setName('');
        setType('CHECKING');
        setColor('#8b5cf6');
        setIcon('Landmark');
        setInitialBalance('0');
        setIsDefault(false);
      }
      setError(null);
    }
  }, [isOpen, accountToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('O nome da conta é obrigatório.');
      return;
    }

    const parsedBalance = parseFloat(initialBalance.replace(',', '.'));
    if (isNaN(parsedBalance)) {
      setError('Informe um saldo inicial numérico válido.');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && accountToEdit) {
        await updateAccountRequest(accountToEdit.id, {
          name: name.trim(),
          type,
          color,
          icon,
          initial_balance: parsedBalance,
          is_default: isDefault,
        });
      } else {
        await createAccountRequest({
          name: name.trim(),
          type,
          color,
          icon,
          initial_balance: parsedBalance,
          is_default: isDefault,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Falha ao salvar conta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Conta Bancária' : 'Nova Conta Bancária'}
      description={
        isEditing
          ? 'Atualize os dados e saldo da sua conta'
          : 'Cadastre um banco ou carteira para separar seus saldos'
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Nome da Conta */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Nome da Conta / Banco *
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Nubank, Banco do Brasil, Itaú, Carteira"
            required
            className="h-11 text-sm bg-slate-900/80 border-slate-800"
          />
        </div>

        {/* Tipo de Conta */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tipo de Conta
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setType(opt.value)}
                className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-left min-h-[44px] flex items-center justify-between ${
                  type === opt.value
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{opt.label}</span>
                {type === opt.value && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>

        {/* Saldo Inicial */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Saldo Inicial (R$)
          </label>
          <Input
            type="text"
            inputMode="decimal"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0,00"
            className="h-11 text-sm bg-slate-900/80 border-slate-800"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Saldo que você já possui nesta conta antes dos lançamentos.
          </span>
        </div>

        {/* Cores */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Cor de Identificação
          </label>
          <div className="flex flex-wrap gap-2 items-center">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.color}
                type="button"
                title={p.name}
                onClick={() => setColor(p.color)}
                style={{ backgroundColor: p.color }}
                className={`w-8 h-8 rounded-full border-2 transition-transform min-h-[32px] min-w-[32px] flex items-center justify-center ${
                  color === p.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100'
                }`}
              >
                {color === p.color && <Check className="w-4 h-4 text-white drop-shadow" />}
              </button>
            ))}
          </div>
        </div>

        {/* Ícones */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Ícone
          </label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setIcon(item.name)}
                  className={`p-2 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 min-h-[44px] px-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tornar Conta Padrão */}
        <div className="pt-2 border-t border-slate-800/80">
          <label className="flex items-center gap-3 cursor-pointer p-2 rounded-xl hover:bg-slate-800/40 transition-colors min-h-[44px]">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-950"
            />
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Definir como Conta Padrão
              </span>
              <span className="text-[11px] text-slate-400 block">
                Transações do WhatsApp sem banco especificado serão lançadas nesta conta.
              </span>
            </div>
          </label>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
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
            className="min-h-[44px] px-6"
          >
            {isEditing ? 'Salvar Alterações' : 'Criar Conta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
