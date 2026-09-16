import React, { useState, useEffect } from 'react';
import { Receivable, createReceivable, updateReceivable } from '../../api/receivables';
import { fetchCategories } from '../../api/categories';
import { fetchAccounts, Account } from '../../api/accounts';
import { fetchContacts, Contact } from '../../api/contacts';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { AlertCircle, Layers, Calendar, ContactRound } from 'lucide-react';
import { formatDateToISO, formatCurrencyInput, parseCurrencyInput, toTitleCasePTBR } from '../../lib/utils';

interface ReceivableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  receivable?: Receivable | null;
}

const selectClass =
  'w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 min-h-[44px]';

const PRESET_INSTALLMENT_OPTIONS = [
  { value: 1, label: '1x - Parcela única (Sem parcelar)' },
  { value: 2, label: '2x - 2 parcelas mensais' },
  { value: 3, label: '3x - 3 parcelas mensais' },
  { value: 4, label: '4x - 4 parcelas mensais' },
  { value: 5, label: '5x - 5 parcelas mensais' },
  { value: 6, label: '6x - 6 parcelas mensais' },
  { value: 7, label: '7x - 7 parcelas mensais' },
  { value: 8, label: '8x - 8 parcelas mensais' },
  { value: 9, label: '9x - 9 parcelas mensais' },
  { value: 10, label: '10x - 10 parcelas mensais' },
  { value: 11, label: '11x - 11 parcelas mensais' },
  { value: 12, label: '12x - 12 parcelas (1 ano)' },
  { value: 18, label: '18x - 18 parcelas' },
  { value: 24, label: '24x - 24 parcelas (2 anos)' },
  { value: 36, label: '36x - 36 parcelas (3 anos)' },
  { value: 48, label: '48x - 48 parcelas (4 anos)' },
  { value: 60, label: '60x - 60 parcelas (5 anos)' },
];

export const ReceivableModal: React.FC<ReceivableModalProps> = ({ isOpen, onClose, onSuccess, receivable }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [contactId, setContactId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [notes, setNotes] = useState('');
  const [totalInstallments, setTotalInstallments] = useState(1);
  const [isCustomInstallments, setIsCustomInstallments] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!receivable;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      loadDependencies();

      if (receivable) {
        setDescription(receivable.description);
        setAmount(formatCurrencyInput(receivable.amount));
        setDueDate(receivable.due_date ? formatDateToISO(receivable.due_date) : '');
        setContactId(receivable.contact_id || '');
        setCategoryId(receivable.category_id || '');
        setAccountId(receivable.account_id || '');
        setNotes(receivable.notes || '');
        setTotalInstallments(1);
      } else {
        setDescription('');
        setAmount('');
        setTotalInstallments(1);
        setIsCustomInstallments(false);
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 5);
        setDueDate(formatDateToISO(defaultDate));
        setContactId('');
        setCategoryId('');
        setAccountId('');
        setNotes('');
      }
    }
  }, [isOpen, receivable]);

  async function loadDependencies() {
    try {
      const [cats, accs, ctts] = await Promise.all([
        fetchCategories(),
        fetchAccounts(),
        fetchContacts({ limit: 200 }),
      ]);
      setCategories(cats.filter((c: any) => c.type === 'INCOME'));
      setAccounts(accs);
      setContacts(ctts.contacts);
    } catch (err) {
      console.error('Erro ao carregar dependências:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numAmount = parseCurrencyInput(amount);

    if (!description.trim()) { setError('A descrição é obrigatória.'); return; }
    if (numAmount <= 0) { setError('Informe um valor válido e positivo.'); return; }
    if (!dueDate) { setError('A data de vencimento é obrigatória.'); return; }

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        description: toTitleCasePTBR(description.trim()),
        amount: numAmount,
        due_date: dueDate,
        contact_id: contactId || null,
        category_id: categoryId || null,
        account_id: accountId || null,
        notes: notes.trim() || null,
      };

      if (receivable) {
        await updateReceivable(receivable.id, payload);
      } else {
        payload.total_installments = totalInstallments > 1 ? totalInstallments : 1;
        await createReceivable(payload);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar conta a receber.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-2 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Descrição */}
        <div>
          <label className="block text-xs font-medium text-din-text mb-1">
            Descrição <span className="text-teal-400">*</span>
          </label>
          <Input
            type="text"
            placeholder="Ex: Aluguel de imóvel, Serviço prestado, Empréstimo..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="text-base"
          />
        </div>

        {/* Valor + Vencimento */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CurrencyInput
            label="Valor (R$)"
            placeholder="0,00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-medium text-din-text mb-1">
              Data de Vencimento <span className="text-teal-400">*</span>
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

        {/* Contato */}
        <div>
          <label className="block text-xs font-medium text-din-text mb-1 flex items-center gap-1.5">
            <ContactRound className="w-3.5 h-3.5 text-teal-400" />
            Contato (quem vai me pagar)
          </label>
          <select value={contactId} onChange={(e) => setContactId(e.target.value)} className={selectClass}>
            <option value="">Sem vínculo a contato...</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.type}] {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Categoria + Conta */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-din-text mb-1">Categoria</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={selectClass}>
              <option value="">Selecione uma categoria...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-din-text mb-1">Conta Prevista (Opcional)</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={selectClass}>
              <option value="">Escolher no momento do recebimento...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Parcelamento (somente criação) */}
        {!receivable && (
          <div className="p-3.5 bg-card border border-border rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-din-text flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>Parcelamento / Repetição</span>
              </label>
              <div className="flex items-center gap-2">
                {totalInstallments > 1 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {totalInstallments} parcelas mensais
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsCustomInstallments(!isCustomInstallments)}
                  className="text-[11px] font-medium text-teal-400 hover:underline transition-colors"
                >
                  {isCustomInstallments ? 'Escolher da lista' : 'Digitar número'}
                </button>
              </div>
            </div>

            {isCustomInstallments ? (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTotalInstallments((prev) => Math.max(1, prev - 1))}
                    disabled={totalInstallments <= 1}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-background border border-border text-din-text hover:bg-card active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-lg font-bold transition-all shrink-0"
                    aria-label="Diminuir parcelas"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={totalInstallments || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          setTotalInstallments(1);
                          return;
                        }
                        const num = parseInt(val, 10);
                        if (!isNaN(num)) {
                          setTotalInstallments(Math.max(1, Math.min(120, num)));
                        }
                      }}
                      placeholder="Qtd (1 a 120)"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-center text-sm font-semibold text-din-text focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 min-h-[44px]"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-din-muted pointer-events-none hidden sm:inline">
                      parcelas
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTotalInstallments((prev) => Math.min(120, prev + 1))}
                    disabled={totalInstallments >= 120}
                    className="w-11 h-11 flex items-center justify-center rounded-xl bg-background border border-border text-din-text hover:bg-card active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-lg font-bold transition-all shrink-0"
                    aria-label="Aumentar parcelas"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCustomInstallments(false)}
                    className="px-3 h-11 text-xs font-medium text-din-muted hover:text-din-text bg-background border border-border rounded-xl shrink-0 transition-colors"
                  >
                    Ver lista
                  </button>
                </div>
                <p className="text-[11px] text-din-muted">
                  Digite qualquer quantidade entre 1 e 120 parcelas mensais.
                </p>
              </div>
            ) : (
              <select
                value={
                  PRESET_INSTALLMENT_OPTIONS.some((o) => o.value === totalInstallments)
                    ? totalInstallments
                    : 'custom'
                }
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomInstallments(true);
                  } else {
                    setTotalInstallments(parseInt(e.target.value, 10));
                  }
                }}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 min-h-[44px]"
              >
                {PRESET_INSTALLMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
                {!PRESET_INSTALLMENT_OPTIONS.some((o) => o.value === totalInstallments) && (
                  <option value={totalInstallments}>
                    {totalInstallments}x - {totalInstallments} parcelas mensais
                  </option>
                )}
                <option value="custom">✏️ Outro número (digitar manualmente)...</option>
              </select>
            )}
            {totalInstallments > 1 && (
              <div className="text-[11px] text-din-muted bg-background/80 p-2.5 rounded-xl border border-border/80 flex items-start gap-2">
                <Calendar className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  Serão criadas <strong>{totalInstallments} contas</strong> de{' '}
                  <strong className="text-din-text">{amount ? amount : 'R$ 0,00'}</strong> nos meses seguintes, todas agendadas para o dia{' '}
                  <strong className="text-din-text">{dueDate ? dueDate.split('-')[2] : '—'}</strong>.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        <div>
          <label className="block text-xs font-medium text-din-text mb-1">Observações (Opcional)</label>
          <textarea
            rows={2}
            placeholder="Informações adicionais sobre este recebimento..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-sm text-din-text focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-3">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="w-full sm:w-1/2 py-3 min-h-[44px]">
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-1/2 py-3 min-h-[44px] bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 font-semibold shadow-lg shadow-teal-500/20"
          >
            {loading ? 'Salvando...' : receivable ? 'Atualizar' : 'Agendar Recebimento'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
