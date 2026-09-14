import React, { useState, useEffect } from 'react';
import { Receivable, receiveReceivable } from '../../api/receivables';
import { Account, fetchAccounts } from '../../api/accounts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { Landmark, CreditCard, Wallet, PiggyBank, Check, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  formatDateToISO,
  formatCurrencyInput,
  parseCurrencyInput,
  toTitleCasePTBR,
} from '../../lib/utils';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  receivable: Receivable | null;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({ isOpen, onClose, onSuccess, receivable }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [receivedDate, setReceivedDate] = useState<string>(formatDateToISO(new Date()));
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && receivable) {
      setError(null);
      setReceivedDate(formatDateToISO(new Date()));
      setReceivedAmount(formatCurrencyInput(receivable.amount));
      loadAccounts();
    }
  }, [isOpen, receivable]);

  async function loadAccounts() {
    setAccountsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
      if (data.length > 0) {
        const preselect =
          data.find((a) => a.id === receivable?.account_id) ||
          data.find((a) => a.is_default) ||
          data[0];
        setSelectedAccountId(preselect.id);
      }
    } catch (err) {
      console.error('Erro ao carregar contas bancárias:', err);
      setError('Não foi possível carregar suas contas bancárias.');
    } finally {
      setAccountsLoading(false);
    }
  }

  function getAccountIcon(iconName: string) {
    switch (iconName) {
      case 'CreditCard': return <CreditCard className="w-5 h-5" />;
      case 'Wallet': return <Wallet className="w-5 h-5" />;
      case 'PiggyBank': return <PiggyBank className="w-5 h-5" />;
      default: return <Landmark className="w-5 h-5" />;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!receivable) return;

    if (!selectedAccountId) {
      setError('Por favor, selecione em qual conta bancária o valor será creditado.');
      return;
    }

    const numAmount = parseCurrencyInput(receivedAmount);
    if (numAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await receiveReceivable(receivable.id, {
        account_id: selectedAccountId,
        received_date: receivedDate || undefined,
        amount: numAmount,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao registrar recebimento.');
    } finally {
      setLoading(false);
    }
  }

  if (!receivable) return null;

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Recebimento">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumo da Conta a Receber */}
        <div className="p-3.5 bg-teal-500/5 border border-teal-500/20 rounded-2xl space-y-1.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-teal-400 font-medium uppercase tracking-wider">Conta a Receber</span>
          </div>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-din-text text-base truncate max-w-[200px] sm:max-w-xs">
              {toTitleCasePTBR(receivable.description)}
            </h4>
            <span className="text-lg font-bold text-teal-400">
              {formatCurrency(receivable.amount)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-din-muted pt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Vencimento: {formatDate(receivable.due_date)}</span>
            {receivable.contact && (
              <>
                <span>•</span>
                <span className="text-din-text">{receivable.contact.name}</span>
              </>
            )}
            {receivable.category && (
              <>
                <span>•</span>
                <span className="text-din-text">{receivable.category.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Seletor de Conta Bancária de Crédito */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-din-text">
            Em qual conta esse valor vai entrar? <span className="text-teal-400">*</span>
          </label>

          {accountsLoading ? (
            <div className="p-4 text-center text-sm text-din-muted">Carregando contas bancárias...</div>
          ) : accounts.length === 0 ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 text-xs">
              Nenhuma conta bancária encontrada. Cadastre uma conta antes de registrar o recebimento.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {accounts.map((acc) => {
                const isSelected = acc.id === selectedAccountId;
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => setSelectedAccountId(acc.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all min-h-[56px] ${
                      isSelected
                        ? 'bg-teal-500/15 border-teal-500 shadow-sm shadow-teal-500/10 text-din-text ring-1 ring-teal-500/30'
                        : 'bg-card border-border text-din-text hover:bg-card-hover hover:border-teal-400/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white"
                        style={{ backgroundColor: acc.color || '#14b8a6' }}
                      >
                        {getAccountIcon(acc.icon)}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-din-text truncate">{acc.name}</p>
                        <p className="text-xs text-din-muted">
                          Saldo:{' '}
                          <span className={acc.current_balance < 0 ? 'text-red-400 font-medium' : 'text-din-text'}>
                            {formatCurrency(acc.current_balance)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Data e Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-din-text mb-1">Data do Recebimento</label>
            <Input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              required
            />
          </div>
          <CurrencyInput
            label="Valor Recebido (R$)"
            value={receivedAmount}
            onChange={(e) => setReceivedAmount(e.target.value)}
            placeholder="0,00"
            required
          />
        </div>

        {/* Aviso de impacto */}
        {selectedAccount && (
          <div className="p-3 bg-card-secondary border border-border rounded-xl text-xs text-din-muted flex items-center space-x-2">
            <span className="text-teal-400 font-semibold">💡 Nota:</span>
            <span>
              Uma receita de{' '}
              <strong>{formatCurrency(parseCurrencyInput(receivedAmount) || receivable.amount)}</strong> será lançada em{' '}
              <strong>{selectedAccount.name}</strong> e o saldo será atualizado.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-1/2 py-3 min-h-[44px]"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading || accountsLoading || accounts.length === 0}
            className="w-full sm:w-1/2 py-3 min-h-[44px] bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 font-semibold shadow-lg shadow-teal-500/20"
          >
            {loading ? 'Processando...' : 'Confirmar Recebimento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
