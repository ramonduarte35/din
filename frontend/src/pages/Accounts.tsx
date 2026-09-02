import React, { useState, useEffect } from 'react';
import {
  getAccountsRequest,
  deleteAccountRequest,
  updateAccountRequest,
  Account,
} from '../api/accounts';
import { AccountModal } from '../components/accounts/AccountModal';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatCurrency } from '../lib/utils';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import {
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  Building2,
  Plus,
  Edit2,
  Trash2,
  Star,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ElementType> = {
  Landmark,
  CreditCard,
  Wallet,
  PiggyBank,
  TrendingUp,
  Coins,
  Building2,
};

export function Accounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirm = useConfirm();
  const toast = useToast();

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const data = await getAccountsRequest();
      setAccounts(data);
    } catch (err) {
      console.error('Erro ao buscar contas:', err);
      toast.error('Erro ao carregar contas bancárias.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleOpenCreate = () => {
    setEditingAccount(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setEditingAccount(account);
    setIsModalOpen(true);
  };

  const handleDelete = async (account: Account) => {
    const ok = await confirm({
      title: 'Excluir Conta Bancária',
      message: `Deseja realmente excluir a conta "${account.name}"? As transações vinculadas a ela serão mantidas no extrato geral.`,
      confirmText: 'Excluir Conta',
      cancelText: 'Cancelar',
      variant: 'danger',
    });

    if (!ok) return;

    setDeletingId(account.id);
    try {
      await deleteAccountRequest(account.id);
      toast.success('Conta excluída com sucesso!');
      await loadAccounts();
    } catch (err: any) {
      toast.error('Falha ao excluir conta', err?.response?.data?.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (account: Account) => {
    try {
      await updateAccountRequest(account.id, { is_default: true });
      toast.success('Conta Padrão Atualizada', `"${account.name}" agora é a sua conta bancária principal.`);
      await loadAccounts();
    } catch (err: any) {
      toast.error('Falha ao definir como padrão', err?.response?.data?.message);
    }
  };

  const totalConsolidatedBalance = accounts.reduce(
    (acc, item) => acc + (item.current_balance || 0),
    0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-fade-in">
      {/* Header Mobile First */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Landmark className="w-6 h-6 text-emerald-400" />
            <span>Contas Bancárias & Carteiras</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Gerencie seus bancos, saldos separados e integração automática com WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAccounts}
            className="h-10 min-h-[44px] text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenCreate}
            className="h-10 min-h-[44px] text-xs px-4 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Resumo Geral de Saldos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 bg-gradient-to-br from-slate-900/90 to-slate-950/80 border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Saldo Total Consolidado
          </span>
          <div className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(totalConsolidatedBalance)}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Somatório de todas as contas
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/90 to-slate-950/80 border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Total de Contas Ativas
          </span>
          <div className="text-2xl font-black text-white tracking-tight">
            {accounts.length}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Bancos, carteiras e investimentos
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-900/90 to-slate-950/80 border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Conta Padrão do WhatsApp
          </span>
          <div className="text-lg font-bold text-emerald-300 tracking-tight flex items-center gap-1.5 truncate">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span className="truncate">
              {accounts.find((a) => a.is_default)?.name || 'Nenhuma'}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            Recebe lançamentos não categorizados
          </span>
        </Card>
      </div>

      {/* Grid de Cards de Contas */}
      {isLoading && accounts.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-slate-700 border-t-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Carregando suas contas...</p>
        </div>
      ) : accounts.length === 0 ? (
        <Card className="p-8 text-center bg-slate-900/40 border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Nenhuma conta cadastrada</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            Cadastre seus bancos (Nubank, Banco do Brasil, Itaú) para separar seus saldos e integrar com a IA.
          </p>
          <Button variant="primary" size="sm" onClick={handleOpenCreate} className="min-h-[44px]">
            <Plus className="w-4 h-4 mr-1.5" /> Criar Primeira Conta
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const IconComponent = ICON_MAP[account.icon] || Landmark;
            const isNegative = (account.current_balance || 0) < 0;

            return (
              <Card
                key={account.id}
                className="p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all bg-[#0d1527] border-slate-800/90 shadow-lg"
              >
                {/* Linha superior com cor do banco */}
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: account.color || '#10b981' }}
                />

                <div>
                  {/* Topo do Card */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md shrink-0"
                        style={{
                          backgroundColor: `${account.color || '#10b981'}20`,
                          color: account.color || '#10b981',
                          border: `1px solid ${account.color || '#10b981'}40`,
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white truncate max-w-[160px]">
                            {account.name}
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {account.type === 'CHECKING'
                            ? 'Conta Corrente'
                            : account.type === 'SAVINGS'
                            ? 'Poupança'
                            : account.type === 'INVESTMENT'
                            ? 'Investimentos'
                            : account.type === 'CREDIT_CARD'
                            ? 'Cartão de Crédito'
                            : account.type === 'CASH'
                            ? 'Carteira Física'
                            : 'Outro'}
                        </span>
                      </div>
                    </div>

                    {account.is_default && (
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" /> Padrão
                      </span>
                    )}
                  </div>

                  {/* Saldo Atual em Destaque */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4">
                    <span className="text-[11px] font-medium text-slate-400 block mb-0.5">
                      Saldo Atual
                    </span>
                    <div
                      className={`text-xl sm:text-2xl font-black tracking-tight ${
                        isNegative ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrency(account.current_balance || 0)}
                    </div>
                  </div>

                  {/* Detalhes do Mês */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" /> Entradas Mês
                      </span>
                      <span className="font-semibold text-emerald-400 text-xs">
                        {formatCurrency(account.month_income || 0)}
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 block flex items-center gap-1">
                        <ArrowDownRight className="w-3 h-3 text-rose-400" /> Saídas Mês
                      </span>
                      <span className="font-semibold text-rose-400 text-xs">
                        {formatCurrency(account.month_expense || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ações Mobile First */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                  {!account.is_default && (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(account)}
                      className="text-[11px] font-medium text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors min-h-[44px] px-2"
                    >
                      <Star className="w-3.5 h-3.5" /> Tornar Padrão
                    </button>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEdit(account)}
                      className="h-9 w-9 p-0 min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-white"
                      title="Editar Conta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(account)}
                      disabled={deletingId === account.id || accounts.length <= 1}
                      className="h-9 w-9 p-0 min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      title="Excluir Conta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadAccounts}
        accountToEdit={editingAccount}
      />
    </div>
  );
}
