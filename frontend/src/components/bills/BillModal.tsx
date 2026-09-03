import React, { useState, useEffect } from 'react';
import { Bill, createBill, updateBill } from '../../api/bills';
import { fetchCategories } from '../../api/categories';
import { fetchAccounts, Account } from '../../api/accounts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { AlertCircle } from 'lucide-react';

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
        setAmount(bill.amount.toString());
        setDueDate(bill.due_date ? bill.due_date.split('T')[0] : '');
        setCategoryId(bill.category_id || '');
        setAccountId(bill.account_id || '');
        setBarcode(bill.barcode || '');
        setNotes(bill.notes || '');
      } else {
        setDescription('');
        setAmount('');
        // Padrão: 5 dias a partir de hoje
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 5);
        setDueDate(defaultDate.toISOString().split('T')[0]);
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
    const numAmount = parseFloat(amount.replace(',', '.'));

    if (!description.trim()) {
      setError('A descrição da conta é obrigatória.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
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
      const payload = {
        description: description.trim(),
        amount: numAmount,
        due_date: new Date(dueDate + 'T12:00:00Z').toISOString(),
        category_id: categoryId || null,
        account_id: accountId || null,
        barcode: barcode.trim() || null,
        notes: notes.trim() || null,
      };

      if (bill) {
        await updateBill(bill.id, payload);
      } else {
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
            <label className="block text-xs font-medium text-din-text mb-1">
              Valor (R$) <span className="text-din-primary">*</span>
            </label>
            <Input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="text-base"
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
