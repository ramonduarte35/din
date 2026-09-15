import React, { useState, useEffect } from 'react';
import {
  Crown,
  Users,
  CreditCard,
  Sparkles,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit2,
  RefreshCw,
  QrCode,
  Calendar,
  X,
  Check,
  Zap,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useToast } from '../contexts/ToastContext';
import {
  fetchAdminSubscriptionsOverview,
  fetchAdminSubscriptionsUsers,
  manageAdminUserSubscription,
  fetchAdminSubscriptionsPayments,
  AdminSubscriptionOverview,
  AdminSubscriptionUser,
} from '../api/subscriptions';

export function AdminSubscriptions() {
  const toast = useToast();

  const [overview, setOverview] = useState<AdminSubscriptionOverview | null>(null);
  const [users, setUsers] = useState<AdminSubscriptionUser[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users');

  // Loading states
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'FREE' | 'PRO'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Manage User Modal State
  const [selectedUser, setSelectedUser] = useState<AdminSubscriptionUser | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [newTier, setNewTier] = useState<'FREE' | 'PRO'>('PRO');
  const [newStatus, setNewStatus] = useState('ACTIVE');
  const [validityChoice, setValidityChoice] = useState<'30' | '90' | '365' | 'lifetime' | 'custom'>('30');
  const [customDate, setCustomDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);

  const loadOverview = async () => {
    try {
      const data = await fetchAdminSubscriptionsOverview();
      setOverview(data);
    } catch {
      toast.error('Erro ao carregar métricas de assinaturas');
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetchAdminSubscriptionsUsers({
        search: searchTerm,
        tier: tierFilter,
        status: statusFilter,
      });
      setUsers(res.users);
    } catch {
      toast.error('Erro ao listar usuários');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadPayments = async () => {
    setIsLoadingPayments(true);
    try {
      const res = await fetchAdminSubscriptionsPayments();
      setPayments(res.payments);
    } catch {
      toast.error('Erro ao carregar histórico de pagamentos');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      const timer = setTimeout(() => {
        loadUsers();
      }, 300);
      return () => clearTimeout(timer);
    } else {
      loadPayments();
    }
  }, [activeTab, searchTerm, tierFilter, statusFilter]);

  const handleOpenManageModal = (u: AdminSubscriptionUser) => {
    setSelectedUser(u);
    setNewTier(u.subscription_tier);
    setNewStatus(u.subscription_status || 'ACTIVE');
    setValidityChoice('30');
    setCustomDate(u.subscription_expires_at ? u.subscription_expires_at.split('T')[0] : '');
    setNotes('');
    setIsManageModalOpen(true);
  };

  const handleSaveManageUser = async () => {
    if (!selectedUser) return;
    setIsSavingUser(true);

    try {
      let daysToAdd: number | undefined;
      let expiresAt: string | null | undefined;
      let isLifetime: boolean | undefined;

      if (newTier === 'FREE') {
        expiresAt = null;
        isLifetime = false;
      } else {
        if (validityChoice === 'lifetime') {
          isLifetime = true;
          expiresAt = null;
        } else if (validityChoice === 'custom') {
          if (!customDate) {
            toast.error('Informe a data de vencimento personalizada');
            setIsSavingUser(false);
            return;
          }
          expiresAt = new Date(`${customDate}T23:59:59Z`).toISOString();
        } else {
          daysToAdd = parseInt(validityChoice, 10);
        }
      }

      await manageAdminUserSubscription(selectedUser.id, {
        subscription_tier: newTier,
        subscription_status: newStatus,
        days_to_add: daysToAdd,
        expires_at: expiresAt,
        is_lifetime: isLifetime,
        notes,
      });

      toast.success(`Plano de ${selectedUser.name} atualizado com sucesso!`);
      setIsManageModalOpen(false);
      loadUsers();
      loadOverview();
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Erro ao atualizar plano');
    } finally {
      setIsSavingUser(false);
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Crown className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
              Gestão de Assinaturas & Planos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-din-muted mt-1">
            Controle de usuários Free e PRO, validades, receita e gateway de pagamentos Asaas.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            loadOverview();
            if (activeTab === 'users') loadUsers();
            else loadPayments();
          }}
          className="self-start sm:self-auto min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between text-din-muted mb-2">
            <span className="text-xs font-semibold">Total Usuários</span>
            <Users className="w-4 h-4 text-din-primary" />
          </div>
          <p className="text-2xl font-black text-din-text">
            {isLoadingOverview ? '...' : overview?.total_users || 0}
          </p>
          <span className="text-[10px] text-din-muted">Cadastros no Din</span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-violet-600/10 to-transparent border-violet-500/30">
          <div className="flex items-center justify-between text-violet-400 mb-2">
            <span className="text-xs font-semibold">Assinantes PRO</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-violet-300">
            {isLoadingOverview ? '...' : overview?.total_pro_users || 0}
          </p>
          <span className="text-[10px] text-violet-400/80 font-medium">WhatsApp & Sem Anúncios</span>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between text-din-muted mb-2">
            <span className="text-xs font-semibold">Plano Grátis</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-black text-din-text">
            {isLoadingOverview ? '...' : overview?.total_free_users || 0}
          </p>
          <span className="text-[10px] text-din-muted">Telegram & Anúncios</span>
        </Card>

        <Card className="p-4 bg-card border-border">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-semibold">MRR Estimado</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {isLoadingOverview ? '...' : formatCurrency(overview?.estimated_mrr || 0)}
          </p>
          <span className="text-[10px] text-din-muted">Receita Mensal Recorrente</span>
        </Card>

        <Card className="p-4 bg-card border-border col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-semibold">Vencendo em 7d</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-300">
            {isLoadingOverview ? '...' : overview?.expiring_soon_users || 0}
          </p>
          <span className="text-[10px] text-amber-400/80">Requerem renovação</span>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all min-h-[44px] flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
              : 'text-din-muted hover:text-din-text hover:bg-card'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuários & Planos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all min-h-[44px] flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/40'
              : 'text-din-muted hover:text-din-text hover:bg-card'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Cobranças Asaas</span>
        </button>
      </div>

      {/* Aba: Usuários & Planos */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="p-4 rounded-2xl bg-card border border-border grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-din-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-card-secondary border border-border rounded-xl text-din-text focus:outline-none focus:ring-1 focus:ring-violet-500 min-h-[44px]"
              />
            </div>

            <div>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-card-secondary border border-border rounded-xl text-din-text focus:outline-none focus:ring-1 focus:ring-violet-500 min-h-[44px]"
              >
                <option value="ALL">Todos os Planos (Free & PRO)</option>
                <option value="PRO">Apenas PRO ⭐</option>
                <option value="FREE">Apenas Grátis (Free)</option>
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card-secondary border border-border rounded-xl text-din-text focus:outline-none focus:ring-1 focus:ring-violet-500 min-h-[44px]"
              >
                <option value="ALL">Todos os Status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="EXPIRED">Expirados / Vencidos</option>
                <option value="PAST_DUE">Inadimplentes (Past Due)</option>
                <option value="CANCELED">Cancelados</option>
              </select>
            </div>
          </div>

          {/* Lista Mobile e Tabela Desktop */}
          {isLoadingUsers ? (
            <div className="p-8 text-center text-din-muted text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
              Carregando lista de usuários...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center text-din-muted text-xs">
              Nenhum usuário encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Visão Mobile: Cards */}
              <div className="grid grid-cols-1 sm:hidden gap-3">
                {users.map((u) => (
                  <div key={u.id} className="p-4 rounded-2xl bg-card border border-border space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-din-text">{u.name}</p>
                        <p className="text-xs text-din-muted">{u.email}</p>
                        {u.phone_number && (
                          <p className="text-[11px] text-din-muted font-mono">{u.phone_number}</p>
                        )}
                      </div>
                      <Badge variant={u.subscription_tier === 'PRO' ? 'pro' : 'free'}>
                        {u.subscription_tier}
                      </Badge>
                    </div>

                    <div className="text-xs text-din-muted flex items-center justify-between pt-2 border-t border-border/50">
                      <span>Validade:</span>
                      <span className="font-semibold text-din-text">
                        {u.subscription_tier === 'PRO'
                          ? u.subscription_expires_at
                            ? u.is_expired
                              ? 'Vencido'
                              : `Restam ${u.days_remaining}d`
                            : 'Vitalício'
                          : 'Vitalício (Free)'}
                      </span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleOpenManageModal(u)}
                      className="w-full min-h-[44px] text-xs font-bold"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                      Gerenciar Plano
                    </Button>
                  </div>
                ))}
              </div>

              {/* Visão Desktop: Tabela */}
              <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-left text-xs text-din-text">
                  <thead className="bg-card-secondary/70 border-b border-border text-din-muted uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3.5">Usuário</th>
                      <th className="p-3.5">Plano</th>
                      <th className="p-3.5">Canais</th>
                      <th className="p-3.5">Status & Validade</th>
                      <th className="p-3.5 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-card-hover/40 transition-colors">
                        <td className="p-3.5">
                          <p className="font-bold text-din-text">{u.name}</p>
                          <p className="text-[11px] text-din-muted">{u.email}</p>
                          {u.phone_number && (
                            <p className="text-[10px] text-din-muted font-mono">{u.phone_number}</p>
                          )}
                        </td>
                        <td className="p-3.5">
                          <Badge variant={u.subscription_tier === 'PRO' ? 'pro' : 'free'}>
                            {u.subscription_tier === 'PRO' ? '⭐ PRO' : 'FREE'}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {u.telegram_id ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-sky-500/15 text-sky-400 border border-sky-500/25">
                                Telegram ✓
                              </span>
                            ) : (
                              <span className="text-[10px] text-din-muted">Telegram —</span>
                            )}
                            {u.phone_number ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                                WhatsApp ✓
                              </span>
                            ) : (
                              <span className="text-[10px] text-din-muted">WhatsApp —</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5">
                          {u.subscription_tier === 'PRO' ? (
                            u.subscription_expires_at ? (
                              u.is_expired ? (
                                <span className="text-rose-400 font-bold flex items-center gap-1">
                                  <XCircle className="w-3.5 h-3.5" /> Expirado
                                </span>
                              ) : (
                                <span className="text-emerald-400 font-bold flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Restam {u.days_remaining} dias
                                </span>
                              )
                            ) : (
                              <span className="text-violet-400 font-bold">Vitalício</span>
                            )
                          ) : (
                            <span className="text-din-muted">Grátis para Sempre</span>
                          )}
                        </td>
                        <td className="p-3.5 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenManageModal(u)}
                            className="min-h-[44px] text-xs font-bold"
                          >
                            <Edit2 className="w-3.5 h-3.5 mr-1" />
                            Gerenciar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aba: Cobranças Asaas */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {isLoadingPayments ? (
            <div className="p-8 text-center text-din-muted text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-400" />
              Carregando transações do Asaas...
            </div>
          ) : payments.length === 0 ? (
            <div className="p-8 rounded-2xl bg-card border border-border text-center text-din-muted text-xs">
              Nenhum pagamento registrado ainda no Asaas.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full text-left text-xs text-din-text">
                <thead className="bg-card-secondary/70 border-b border-border text-din-muted uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">ID Pagamento</th>
                    <th className="p-3.5">Usuário</th>
                    <th className="p-3.5">Valor</th>
                    <th className="p-3.5">Forma</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Data</th>
                    <th className="p-3.5 text-right">Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-card-hover/40 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-din-muted">
                        {p.asaas_payment_id}
                      </td>
                      <td className="p-3.5">
                        <p className="font-bold text-din-text">{p.user?.name || '—'}</p>
                        <p className="text-[11px] text-din-muted">{p.user?.email || '—'}</p>
                      </td>
                      <td className="p-3.5 font-bold text-din-text">
                        {formatCurrency(Number(p.amount))}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-card-secondary border border-border">
                          {p.billing_type}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {p.status === 'RECEIVED' || p.status === 'CONFIRMED' ? (
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Pago
                          </span>
                        ) : p.status === 'OVERDUE' ? (
                          <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Vencido
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" /> {p.status}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-[11px] text-din-muted">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3.5 text-right">
                        {p.invoice_url ? (
                          <a
                            href={p.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-violet-400 hover:text-violet-300 hover:underline min-h-[44px] p-2"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-din-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de Gestão Manual do Plano do Usuário */}
      {isManageModalOpen && selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
          onClick={() => setIsManageModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[92vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-bold text-base text-din-text">Gerenciar Plano</h3>
                <p className="text-xs text-din-muted mt-0.5">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button
                type="button"
                onClick={() => setIsManageModalOpen(false)}
                aria-label="Fechar modal"
                className="p-2 rounded-full text-din-muted hover:text-din-text hover:bg-card-secondary min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seleção do Plano */}
            <div>
              <label className="block text-xs font-bold text-din-text mb-2">Plano Desejado</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setNewTier('FREE')}
                  className={`p-3 rounded-xl border font-bold text-xs transition-all min-h-[44px] ${
                    newTier === 'FREE'
                      ? 'bg-slate-700/20 border-slate-400 text-din-text ring-2 ring-slate-400/20'
                      : 'bg-card-secondary border-border text-din-muted'
                  }`}
                >
                  Plano Grátis (FREE)
                </button>

                <button
                  type="button"
                  onClick={() => setNewTier('PRO')}
                  className={`p-3 rounded-xl border font-bold text-xs transition-all min-h-[44px] ${
                    newTier === 'PRO'
                      ? 'bg-violet-600/20 border-violet-500 text-violet-300 ring-2 ring-violet-500/30'
                      : 'bg-card-secondary border-border text-din-muted'
                  }`}
                >
                  ⭐ Plano PRO
                </button>
              </div>
            </div>

            {/* Opções de Validade (Apenas se PRO) */}
            {newTier === 'PRO' && (
              <div>
                <label className="block text-xs font-bold text-din-text mb-2">Validade da Assinatura</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setValidityChoice('30')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold min-h-[44px] ${
                      validityChoice === '30'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-card-secondary border-border text-din-muted'
                    }`}
                  >
                    +30 dias (Mensal)
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidityChoice('90')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold min-h-[44px] ${
                      validityChoice === '90'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-card-secondary border-border text-din-muted'
                    }`}
                  >
                    +90 dias (Trimestral)
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidityChoice('365')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold min-h-[44px] ${
                      validityChoice === '365'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-card-secondary border-border text-din-muted'
                    }`}
                  >
                    +365 dias (1 Ano)
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidityChoice('lifetime')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold min-h-[44px] ${
                      validityChoice === 'lifetime'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-card-secondary border-border text-din-muted'
                    }`}
                  >
                    Vitalício (Sem fim)
                  </button>
                </div>

                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setValidityChoice('custom')}
                    className={`w-full p-2.5 rounded-xl border text-xs font-semibold min-h-[44px] mb-2 ${
                      validityChoice === 'custom'
                        ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                        : 'bg-card-secondary border-border text-din-muted'
                    }`}
                  >
                    Data Específica de Expiração
                  </button>

                  {validityChoice === 'custom' && (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-card-secondary border border-border rounded-xl text-din-text min-h-[44px]"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Justificativa / Notas */}
            <div>
              <label className="block text-xs font-bold text-din-text mb-1">
                Motivo / Justificativa (Auditoria)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Concessão cortesia, ativação manual via PIX direto, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-card-secondary border border-border rounded-xl text-din-text focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setIsManageModalOpen(false)}
                className="min-h-[44px]"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveManageUser}
                isLoading={isSavingUser}
                className="min-h-[44px] font-bold bg-violet-600 hover:bg-violet-500"
              >
                Salvar Alterações
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
