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
import { AccountsWidgetSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useConfirm } from '../contexts/ConfirmContext';
import { useToast } from '../contexts/ToastContext';
import { usePrivacy } from '../contexts/PrivacyContext';
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
  const { maskValue } = usePrivacy();

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

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={loadAccounts}
            className="flex-1 sm:flex-initial h-10 min-h-[44px] text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            variant="emerald"
            size="sm"
            onClick={handleOpenCreate}
            className="flex-1 sm:flex-initial h-10 min-h-[44px] text-xs px-4 shadow-lg shadow-emerald-500/20 font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Resumo Geral de Saldos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 sm:p-5 bg-card border-border shadow-lg">
          <span className="text-xs font-semibold text-din-muted block mb-1">
            Saldo Total Consolidado
          </span>
          <div className="text-2xl font-black text-din-text font-mono tracking-tight">
            {maskValue(totalConsolidatedBalance)}
          </div>
          <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Somatório de todas as contas
          </span>
        </Card>

        <Card className="p-4 sm:p-5 bg-card border-border shadow-lg">
          <span className="text-xs font-semibold text-din-muted block mb-1">
            Total de Contas Ativas
          </span>
          <div className="text-2xl font-black text-din-text font-mono tracking-tight">
            {accounts.length}
          </div>
          <span className="text-[11px] text-din-muted block mt-1">
            Bancos, carteiras e investimentos
          </span>
        </Card>

        <Card className="p-4 sm:p-5 bg-card border-border shadow-lg">
          <span className="text-xs font-semibold text-din-muted block mb-1">
            Conta Padrão do WhatsApp
          </span>
          <div className="text-lg font-bold text-din-primary tracking-tight flex items-center gap-1.5 truncate">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
            <span className="truncate">
              {accounts.find((a) => a.is_default)?.name || 'Nenhuma'}
            </span>
          </div>
          <span className="text-[11px] text-din-muted block mt-1">
            Recebe lançamentos não categorizados
          </span>
        </Card>
      </div>

      {/* Grid de Cards de Contas */}
      {isLoading && accounts.length === 0 ? (
        <AccountsWidgetSkeleton />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={<Landmark className="w-8 h-8" />}
          title="Nenhuma conta cadastrada"
          description="Cadastre seus bancos (Nubank, Banco do Brasil, Itaú) para separar seus saldos e integrar com a IA."
          actionText="Criar Primeira Conta"
          onAction={handleOpenCreate}
          variant="emerald"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => {
            const isNegative = (account.current_balance || 0) < 0;

            return (
              <Card
                key={account.id}
                className="p-5 border border-border bg-card rounded-3xl shadow-lg hover:border-din-primary/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Topo do Card: Nome e Tag Padrão */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-md"
                        style={{ backgroundColor: account.color || '#10b981' }}
                      >
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-din-text text-base truncate max-w-[150px]">
                          {account.name}
                        </h4>
                        <span className="text-xs text-din-muted capitalize">
                          {account.type.toLowerCase()}
                        </span>
                      </div>
                    </div>

                    {account.is_default && (
                      <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 shrink-0">
                        <Star className="w-3 h-3 fill-amber-400" />
                        Padrão
                      </span>
                    )}
                  </div>

                  {/* Saldo Atual */}
                  <div className="p-3.5 rounded-2xl bg-card-secondary border border-border mb-4">
                    <span className="text-[10px] font-bold text-din-muted uppercase tracking-wider block mb-0.5">
                      Saldo Disponível
                    </span>
                    <div
                      className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                        isNegative ? 'text-rose-500' : 'text-emerald-500'
                      }`}
                    >
                      {maskValue(account.current_balance || 0)}
                    </div>
                  </div>
                </div>

                {/* Ações do Card */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    {!account.is_default && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(account)}
                        className="text-xs font-semibold text-din-muted hover:text-amber-300 flex items-center gap-1.5 transition-colors min-h-[44px] py-2 px-1 touch-manipulation"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Definir Padrão</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(account)}
                      className="rounded-xl text-din-muted hover:text-din-text"
                      title="Editar Conta"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(account)}
                      disabled={deletingId === account.id || accounts.length <= 1}
                      className="rounded-xl text-din-muted hover:text-rose-500 hover:bg-rose-500/10"
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

      {/* Modal de Criação / Edição de Conta */}
      <AccountModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
        }}
        onSuccess={loadAccounts}
        accountToEdit={editingAccount}
      />
    </div>
  );
}
