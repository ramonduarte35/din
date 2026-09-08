import React, { useState, useEffect } from 'react';
import { Bill, createBill, updateBill } from '../../api/bills';
import { fetchCategories } from '../../api/categories';
import { fetchAccounts, Account } from '../../api/accounts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { AlertCircle, Layers, Calendar } from 'lucide-react';
import { formatDateToISO, formatCurrencyInput, parseCurrencyInput } from '../../lib/utils';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bill?: Bill | null;
}

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bill,
}) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [notes, setNotes] = useState('');
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      loadDependencies();

      if (bill) {
        setDescription(bill.description);
        setAmount(formatCurrencyInput(bill.amount));
        setDueDate(bill.due_date ? formatDateToISO(bill.due_date) : '');
        setCategoryId(bill.category_id || '');
        setAccountId(bill.account_id || '');
        setBarcode(bill.barcode || '');
        setNotes(bill.notes || '');
      } else {
        setDescription('');
        setAmount('');
        setTotalInstallments(1);
        // Padrão: 5 dias a partir de hoje
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 5);
        setDueDate(formatDateToISO(defaultDate));
        setCategoryId('');
        setAccountId('');
        setBarcode('');
        setNotes('');
      }
    }
  }, [isOpen, bill]);

  async function loadDependencies() {
    try {
      const [cats, accs] = await Promise.all([
        fetchCategories(),
        fetchAccounts(),
      ]);
      setCategories(cats.filter((c: any) => c.type === 'EXPENSE'));
      setAccounts(accs);
    } catch (err) {
      console.error('Erro ao carregar categorias/contas:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseCurrencyInput(amount);

    if (!description.trim()) {
      setError('A descrição da conta é obrigatória.');
      return;
    }

    if (numAmount <= 0) {
      setError('Informe um valor válido e positivo.');
      return;
    }

    if (!dueDate) {
      setError('A data de vencimento é obrigatória.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        description: description.trim(),
        amount: numAmount,
        due_date: dueDate,
        category_id: categoryId || null,
        account_id: accountId || null,
        barcode: barcode.trim() || null,
        notes: notes.trim() || null,
      };

      if (bill) {
        await updateBill(bill.id, payload);
      } else {
        payload.total_installments = totalInstallments > 1 ? totalInstallments : 1;
        await createBill(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar conta a pagar:', err);
      setError(err.response?.data?.message || 'Erro ao salvar conta a pagar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bill ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-din-text mb-1">
            Descrição da Conta <span className="text-din-primary">*</span>
          </label>
          <Input
            type="text"
            placeholder="Ex: Conta de Luz, Aluguel, Internet..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <CurrencyInput
              label="Valor (R$)"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-din-text mb-1">
              Data de Vencimento <span className="text-din-primary">*</span>
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-din-text mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
            >
              <option value="">Selecione uma categoria...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-din-text mb-1">Conta Prevista (Opcional)</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
            >
              <option value="">Escolher no momento do pagamento...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!bill && (
          <div className="p-3.5 bg-card border border-border rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-din-text flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-din-primary" />
                <span>Parcelamento / Repetição</span>
              </label>
              {totalInstallments > 1 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-din-primary/10 text-din-primary border border-din-primary/20">
                  {totalInstallments} parcelas mensais
                </span>
              )}
            </div>

            <select
              value={totalInstallments}
              onChange={(e) => setTotalInstallments(parseInt(e.target.value, 10))}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary min-h-[44px]"
            >
              <option value={1}>1x - Parcela única (Sem parcelar)</option>
              <option value={2}>2x - 2 parcelas mensais</option>
              <option value={3}>3x - 3 parcelas mensais</option>
              <option value={4}>4x - 4 parcelas mensais</option>
              <option value={5}>5x - 5 parcelas mensais</option>
              <option value={6}>6x - 6 parcelas mensais</option>
              <option value={10}>10x - 10 parcelas mensais</option>
              <option value={12}>12x - 12 parcelas (1 ano)</option>
              <option value={18}>18x - 18 parcelas</option>
              <option value={24}>24x - 24 parcelas (2 anos)</option>
              <option value={36}>36x - 36 parcelas (3 anos)</option>
              <option value={48}>48x - 48 parcelas (4 anos)</option>
              <option value={60}>60x - 60 parcelas (5 anos)</option>
            </select>

            {totalInstallments > 1 && (
              <div className="text-[11px] text-din-muted bg-background/80 p-2.5 rounded-xl border border-border/80 flex items-start gap-2">
                <Calendar className="w-4 h-4 text-din-primary shrink-0 mt-0.5" />
                <span>
                  Serão criadas <strong>{totalInstallments} contas</strong> de{' '}
                  <strong className="text-din-text">{amount ? amount : 'R$ 0,00'}</strong> nos meses seguintes, todas agendadas para o dia{' '}
                  <strong className="text-din-text">{dueDate ? dueDate.split('-')[2] : '—'}</strong>.
                </span>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-din-text mb-1">
            Código de Barras / Linha Digitável / Chave PIX (Opcional)
          </label>
          <Input
            type="text"
            placeholder="Cole o código do boleto ou chave PIX copia e cola..."
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            className="text-xs font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-din-text mb-1">Observações (Opcional)</label>
          <textarea
            rows={2}
            placeholder="Informações adicionais sobre esta conta..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-din-primary/40 focus:border-din-primary resize-none"
          />
        </div>

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
            disabled={loading}
            className="w-full sm:w-1/2 py-3 min-h-[44px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 font-semibold shadow-lg shadow-emerald-500/20"
          >
            {loading ? 'Salvando...' : bill ? 'Atualizar Conta' : 'Agendar Conta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
