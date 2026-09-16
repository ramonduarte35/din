import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { resetUserDataRequest } from '../../api/auth';
import { useToast } from '../../contexts/ToastContext';
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Receipt,
  CalendarDays,
  Coins,
  TrendingDown,
  Target,
  Tag,
  Users,
} from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResetDataModal({ isOpen, onClose, onSuccess }: ResetDataModalProps) {
  const toast = useToast();

  const [deleteTransactions, setDeleteTransactions] = useState(true);
  const [deleteBills, setDeleteBills] = useState(true);
  const [deleteReceivables, setDeleteReceivables] = useState(true);
  const [resetAccountBalances, setResetAccountBalances] = useState(true);
  const [deleteBudgetsAndGoals, setDeleteBudgetsAndGoals] = useState(false);
  const [deleteCategories, setDeleteCategories] = useState(false);
  const [deleteContacts, setDeleteContacts] = useState(false);

  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDeleteTransactions(true);
      setDeleteBills(true);
      setDeleteReceivables(true);
      setResetAccountBalances(true);
      setDeleteBudgetsAndGoals(false);
      setDeleteCategories(false);
      setDeleteContacts(false);
      setConfirmText('');
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const hasAnySelection =
    deleteTransactions ||
    deleteBills ||
    deleteReceivables ||
    resetAccountBalances ||
    deleteBudgetsAndGoals ||
    deleteCategories ||
    deleteContacts;

  const isConfirmed = confirmText.trim().toUpperCase() === 'ZERAR';

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConfirmed || !hasAnySelection || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await resetUserDataRequest({
        delete_transactions: deleteTransactions,
        delete_bills: deleteBills,
        delete_receivables: deleteReceivables,
        reset_account_balances: resetAccountBalances,
        delete_budgets_and_goals: deleteBudgetsAndGoals,
        delete_categories: deleteCategories,
        delete_contacts: deleteContacts,
        confirmation: 'ZERAR',
      });

      toast.success(
        'Finanças Reiniciadas com Sucesso!',
        'Seus dados de teste foram limpos. Você pode agora definir os saldos das suas contas e começar a registrar do zero.'
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Falha ao reiniciar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reiniciar Finanças / Limpeza de Dados"
      description="Escolha o que deseja limpar para começar seu controle financeiro do zero com total segurança."
      maxWidth="lg"
    >
      <form onSubmit={handleReset} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Card Informativo */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs leading-relaxed flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div>
            <span className="font-bold block text-amber-200 mb-0.5">Atenção: Ação irreversível!</span>
            Os registros selecionados abaixo serão apagados permanentemente da sua conta.
            Utilize esta rotina quando quiser apagar dados de teste e iniciar seu controle real com saldos limpos.
          </div>
        </div>

        {/* Seleção do que Apagar */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-din-muted mb-1.5">
            Selecione o que você deseja zerar / apagar:
          </label>

          {/* Opção: Transações */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={deleteTransactions}
              onChange={(e) => setDeleteTransactions(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Transações / Extrato Geral</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Apaga todos os lançamentos de receitas e despesas que você testou ou registrou.
              </p>
            </div>
          </label>

          {/* Opção: Contas a Pagar */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={deleteBills}
              onChange={(e) => setDeleteBills(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Contas a Pagar (Boletos e Despesas Futuras)</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Remove todas as contas a pagar agendadas, pendentes ou pagas.
              </p>
            </div>
          </label>

          {/* Opção: Contas a Receber */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={deleteReceivables}
              onChange={(e) => setDeleteReceivables(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-teal-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Contas a Receber</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Remove todos os recebimentos agendados ou pendentes.
              </p>
            </div>
          </label>

          {/* Opção: Zerar Saldos das Contas */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={resetAccountBalances}
              onChange={(e) => setResetAccountBalances(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Zerar Saldos das Contas Bancárias</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Redefine o saldo de abertura de cada banco para <strong>R$ 0,00</strong>. Seus bancos cadastrados (Nubank, Itaú, etc.) <strong>permanecerão intactos</strong>.
              </p>
            </div>
          </label>

          {/* Opção: Metas e Orçamentos */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={deleteBudgetsAndGoals}
              onChange={(e) => setDeleteBudgetsAndGoals(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Metas e Orçamentos Planejados</span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Remove metas e limites de gastos mensais cadastrados.
              </p>
            </div>
          </label>

          {/* Opção: Categorias Personalizadas */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={deleteCategories}
              onChange={(e) => setDeleteCategories(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Categorias Personalizadas Criadas por Você</span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Deixe desmarcado se você deseja continuar usando as categorias que já organizou.
              </p>
            </div>
          </label>

          {/* Opção: Contatos */}
          <label className="flex items-start gap-3 p-3 rounded-2xl border border-border bg-card-secondary hover:border-din-primary/40 transition-colors cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={deleteContacts}
              onChange={(e) => setDeleteContacts(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded border-border bg-card text-din-primary focus:ring-din-primary shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <span className="text-xs font-bold text-din-text">Contatos / Clientes / Fornecedores</span>
              </div>
              <p className="text-[11px] text-din-muted mt-0.5">
                Deixe desmarcado se você deseja preservar sua lista de contatos vinculados.
              </p>
            </div>
          </label>
        </div>

        {/* Card de Dados Preservados */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-200 block mb-0.5">
              Preservado com Segurança por Padrão:
            </span>
            Suas contas bancárias cadastradas, sua assinatura MeuDino, seu número de WhatsApp/Telegram e suas categorias continuam totalmente seguros e prontos para uso.
          </div>
        </div>

        {/* Campo de Confirmação por Texto */}
        <div className="p-4 rounded-2xl bg-card-secondary border border-rose-500/30 space-y-2">
          <label className="block text-xs font-bold text-din-text">
            Digite a palavra <span className="text-rose-400 font-mono tracking-wider font-black">ZERAR</span> para confirmar:
          </label>
          <Input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Digite ZERAR para desbloquear"
            className="h-11 text-center font-mono font-bold tracking-widest uppercase text-sm border-rose-500/40 focus:border-rose-500 focus:ring-rose-500/30"
            autoComplete="off"
          />
          <p className="text-[11px] text-din-muted text-center">
            Esta proteção garante que nenhum dado seja apagado acidentalmente.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto min-h-[44px]"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={!isConfirmed || !hasAnySelection || isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto min-h-[44px] px-6 bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shadow-lg shadow-rose-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4 mr-1.5" />
            <span>Confirmar e Zerar Dados</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
