import React, { useState, useEffect } from 'react';
import { Bill, payBill } from '../../api/bills';
import { Account, fetchAccounts } from '../../api/accounts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Landmark, CreditCard, Wallet, PiggyBank, Check, Calendar, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill: Bill | null;
}

export const PayBillModal: React.FC<PayBillModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bill,
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [paidDate, setPaidDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && bill) {
      setError(null);
      setPaidDate(new Date().toISOString().split('T')[0]);
      setPaidAmount(bill.amount.toString());
      loadAccounts();
    }
  }, [isOpen, bill]);

  async function loadAccounts() {
    setAccountsLoading(true);
    try {
      const data = await fetchAccounts();
      setAccounts(data);
      if (data.length > 0) {
        // Se a conta já tinha uma conta sugerida ou padrão
        const preselect =
          data.find((a) => a.id === bill?.account_id) ||
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
      case 'Landmark':
        return <Landmark className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'Wallet':
        return <Wallet className="w-5 h-5" />;
      case 'PiggyBank':
        return <PiggyBank className="w-5 h-5" />;
      default:
        return <Landmark className="w-5 h-5" />;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bill) return;

    if (!selectedAccountId) {
      setError('Por favor, selecione de qual conta bancária o valor será debitado.');
      return;
    }

    const numAmount = parseFloat(paidAmount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor válido.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await payBill(bill.id, {
        account_id: selectedAccountId,
        paid_date: paidDate ? new Date(paidDate + 'T12:00:00Z').toISOString() : undefined,
        amount: numAmount,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao pagar conta:', err);
      setError(err.response?.data?.message || 'Erro ao processar pagamento da conta.');
    } finally {
      setLoading(false);
    }
  }

  if (!bill) return null;

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar Pagamento">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resumo da Conta a Pagar */}
        <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-1.5">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Conta a Liquidar</span>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-white text-base truncate max-w-[200px] sm:max-w-xs">
              {bill.description}
            </h4>
            <span className="text-lg font-bold text-emerald-400">
              {formatCurrency(bill.amount)}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}</span>
            {bill.category && (
              <>
                <span>•</span>
                <span className="text-slate-300">{bill.category.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Seletor de Conta Bancária de Débito */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-200">
            De qual conta esse valor vai sair? <span className="text-emerald-400">*</span>
          </label>

          {accountsLoading ? (
            <div className="p-4 text-center text-sm text-slate-400">Carregando contas bancárias...</div>
          ) : accounts.length === 0 ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
              Nenhuma conta bancária encontrada. Cadastre uma conta antes de pagar.
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
                        ? 'bg-emerald-500/15 border-emerald-500 shadow-sm shadow-emerald-500/10 text-white ring-1 ring-emerald-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm text-white"
                        style={{ backgroundColor: acc.color || '#10b981' }}
                      >
                        {getAccountIcon(acc.icon)}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-white truncate">{acc.name}</p>
                        <p className="text-xs text-slate-400">
                          Saldo: <span className={acc.current_balance < 0 ? 'text-red-400 font-medium' : 'text-slate-300'}>{formatCurrency(acc.current_balance)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-slate-600" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Campos de Data e Valor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Data do Pagamento</label>
            <Input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Valor Pago (R$)</label>
            <Input
              type="number"
              step="0.01"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </div>
        </div>

        {/* Aviso de impacto */}
        {selectedAccount && (
          <div className="p-3 bg-slate-800/40 border border-slate-700/40 rounded-xl text-xs text-slate-400 flex items-center space-x-2">
            <span className="text-emerald-400 font-semibold">ℹ️ Nota:</span>
            <span>
              Uma despesa de <strong>{formatCurrency(parseFloat(paidAmount) || bill.amount)}</strong> será lançada no <strong>{selectedAccount.name}</strong> e o saldo será atualizado.
            </span>
          </div>
        )}

        {/* Botões de Ação */}
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
            className="w-full sm:w-1/2 py-3 min-h-[44px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Processando...' : 'Confirmar Pagamento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
