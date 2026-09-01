import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  QrCode,
  RefreshCw,
  Plus,
  Trash2,
  PowerOff,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  MessageSquare,
  AlertTriangle,
  HelpCircle,
  ExternalLink,
  Edit2,
  X,
  Radio,
  Eye,
  Check,
} from 'lucide-react';
import {
  AdminWhatsAppInstance,
  AdminWhatsAppLog,
  QrCodeResponse,
  fetchAdminInstances,
  createAdminInstance,
  getAdminInstanceQrCode,
  getAdminInstanceStatus,
  restartAdminInstance,
  logoutAdminInstance,
  updateAdminInstance,
  deleteAdminInstance,
  fetchAdminLogs,
} from '../api/admin';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { formatCurrency, formatPhone } from '../lib/utils';

export function AdminWhatsApp() {
  const [instances, setInstances] = useState<AdminWhatsAppInstance[]>([]);
  const [logs, setLogs] = useState<AdminWhatsAppLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'instances' | 'logs'>('instances');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Active instance selection
  const [selectedInstance, setSelectedInstance] = useState<AdminWhatsAppInstance | null>(null);
  const [qrCodeData, setQrCodeData] = useState<QrCodeResponse | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrCountdown, setQrCountdown] = useState(25);
  const qrPollingRef = useRef<NodeJS.Timeout | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    instance_name: '',
    phone_number: '',
    label: '',
    is_active: true,
  });

  const [editForm, setEditForm] = useState({
    phone_number: '',
    label: '',
    is_active: true,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load instances & logs
  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);
    try {
      const [instData, logData] = await Promise.all([
        fetchAdminInstances(),
        fetchAdminLogs({ limit: 30 }),
      ]);
      setInstances(instData);
      setLogs(logData.data);
    } catch (err: any) {
      console.error('Erro ao carregar dados do admin:', err);
      showMessage('error', 'Falha ao carregar instâncias do WhatsApp.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // QR Code handlers
  const handleOpenQrCode = async (instance: AdminWhatsAppInstance) => {
    setSelectedInstance(instance);
    setIsQrModalOpen(true);
    setQrLoading(true);
    setQrCodeData(null);
    setQrCountdown(25);

    try {
      const data = await getAdminInstanceQrCode(instance.id);
      setQrCodeData(data);
      startQrPolling(instance.id);
    } catch (err: any) {
      showMessage('error', err?.response?.data?.message || 'Erro ao gerar QR Code.');
    } finally {
      setQrLoading(false);
    }
  };

  const startQrPolling = (instanceId: string) => {
    if (qrPollingRef.current) clearInterval(qrPollingRef.current);

    qrPollingRef.current = setInterval(async () => {
      try {
        // Se o QR Code ainda não foi gerado, tenta buscar novamente
        getAdminInstanceQrCode(instanceId).then((res) => {
          if (res.base64) {
            setQrCodeData(res);
          }
        }).catch(() => {});

        // Verifica se o usuário escaneou e conectou o WhatsApp
        const status = await getAdminInstanceStatus(instanceId);
        if (status.is_connected) {
          if (qrPollingRef.current) clearInterval(qrPollingRef.current);
          showMessage('success', `🎉 WhatsApp da instância "${status.instance_name}" conectado com sucesso!`);
          setIsQrModalOpen(false);
          loadData(true);
        }
      } catch (err) {
        // ignore polling error
      }
    }, 2000);
  };

  const handleCloseQrModal = () => {
    if (qrPollingRef.current) clearInterval(qrPollingRef.current);
    setIsQrModalOpen(false);
    setSelectedInstance(null);
    setQrCodeData(null);
  };

  // Actions on instance
  const handleRestart = async (id: string, name: string) => {
    if (!confirm(`Deseja realmente reiniciar a conexão da instância "${name}"?`)) return;
    try {
      await restartAdminInstance(id);
      showMessage('success', `Instância "${name}" reiniciada.`);
      loadData(true);
    } catch (err: any) {
      showMessage('error', 'Erro ao reiniciar instância.');
    }
  };

  const handleLogout = async (id: string, name: string) => {
    if (!confirm(`Deseja deslogar o WhatsApp da instância "${name}"?`)) return;
    try {
      await logoutAdminInstance(id);
      showMessage('success', `Sessão deslogada com sucesso.`);
      loadData(true);
    } catch (err: any) {
      showMessage('error', 'Erro ao deslogar instância.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja EXCLUIR a instância "${name}"? Isso removerá a sessão do WhatsApp e o número do sistema.`)) return;
    try {
      await deleteAdminInstance(id);
      showMessage('success', `Instância "${name}" removida com sucesso.`);
      loadData(true);
    } catch (err: any) {
      showMessage('error', 'Erro ao excluir instância.');
    }
  };

  const handleOpenEdit = (instance: AdminWhatsAppInstance) => {
    setSelectedInstance(instance);
    setEditForm({
      label: instance.label,
      phone_number: instance.phone_number,
      is_active: instance.is_active,
    });
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      await createAdminInstance(createForm);
      showMessage('success', `Instância "${createForm.instance_name}" criada com sucesso!`);
      setIsCreateModalOpen(false);
      setCreateForm({
        instance_name: '',
        phone_number: '',
        label: '',
        is_active: true,
      });
      loadData(true);
    } catch (err: any) {
      showMessage('error', err?.response?.data?.message || 'Erro ao criar instância.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance) return;
    setFormSubmitting(true);
    try {
      await updateAdminInstance(selectedInstance.id, editForm);
      showMessage('success', `Instância atualizada com sucesso!`);
      setIsEditModalOpen(false);
      loadData(true);
    } catch (err: any) {
      showMessage('error', err?.response?.data?.message || 'Erro ao atualizar instância.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Stats calculation
  const totalInstances = instances.length;
  const connectedInstances = instances.filter((i) => i.is_connected).length;
  const activeInstances = instances.filter((i) => i.is_active).length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Gestão WhatsApp & Evolution Go</h1>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Configure números oficiais do sistema, conecte via QR Code e monitore logs de mensagens em tempo real.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar Status</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Instância</span>
          </Button>
        </div>
      </div>

      {/* Global Action Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total de Instâncias</span>
            <div className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{totalInstances}</p>
          <p className="text-[11px] text-slate-500 mt-1">Configuradas no banco</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">WhatsApp Conectado</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2">{connectedInstances}</p>
          <p className="text-[11px] text-slate-500 mt-1">Sessões ativas no gateway</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Ativas no Dashboard</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-300 mt-2">{activeInstances}</p>
          <p className="text-[11px] text-slate-500 mt-1">Visíveis para os usuários</p>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mensagens Recebidas</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-teal-300 mt-2">{logs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Últimos logs registrados</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('instances')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'instances'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Instâncias & Números ({instances.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'logs'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Logs de Mensagens IA ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: INSTÂNCIAS */}
      {activeTab === 'instances' && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
              <p className="text-xs text-slate-400 mt-4">Verificando status das instâncias no Evolution Go...</p>
            </div>
          ) : instances.length === 0 ? (
            <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
              <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">Nenhuma instância cadastrada</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
                Cadastre sua primeira instância de WhatsApp para que os usuários possam registrar gastos via IA.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-emerald-500 text-slate-950 font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Instância
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {instances.map((instance) => (
                <div
                  key={instance.id}
                  className="glass-card rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700/80 transition-all duration-200 shadow-lg shadow-black/20"
                >
                  {/* Top Header Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-mono font-medium text-slate-400 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700/50">
                          {instance.instance_name}
                        </span>
                        <h3 className="text-base font-bold text-white mt-2 leading-snug">{instance.label}</h3>
                      </div>

                      {/* Connection status badge */}
                      <div>
                        {instance.is_connected ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Conectado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <span className="w-2 h-2 rounded-full bg-amber-400" />
                            Desconectado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Phone Number Display */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-300 font-mono text-sm font-semibold">
                        <Smartphone className="w-4 h-4 text-emerald-400" />
                        <span>{formatPhone(instance.phone_number)}</span>
                      </div>
                      <a
                        href={`https://wa.me/${instance.phone_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        title="Abrir WhatsApp"
                      >
                        <span>Testar</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* Dashboard visibility info */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-400">Exibição no Dashboard:</span>
                      {instance.is_active ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Visível para usuários
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Oculto
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {/* Scan QR Button */}
                      <Button
                        size="sm"
                        onClick={() => handleOpenQrCode(instance)}
                        className={`text-xs font-bold ${
                          instance.is_connected
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5 mr-1.5" />
                        <span>{instance.is_connected ? 'Reconectar QR' : 'Escanear QR'}</span>
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(instance)}
                        className="text-slate-400 hover:text-white p-2"
                        title="Editar Informações"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Restart Socket */}
                      <button
                        onClick={() => handleRestart(instance.id, instance.instance_name)}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                        title="Reiniciar Instância"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Logout Session */}
                      {instance.is_connected && (
                        <button
                          onClick={() => handleLogout(instance.id, instance.instance_name)}
                          className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                          title="Deslogar WhatsApp"
                        >
                          <PowerOff className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(instance.id, instance.instance_name)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition-colors"
                        title="Remover Instância"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LOGS DE MENSAGENS */}
      {activeTab === 'logs' && (
        <div className="glass-card rounded-2xl border border-slate-800/80 overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Histórico de Mensagens Processadas pelo Webhook</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Logs de tráfego de entrada recebidos pelo Evolution Go e processados pelo motor de IA.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData(true)}
              className="text-xs"
            >
              <RefreshCw className={`w-3 h-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Data / Hora</th>
                  <th className="py-3 px-4">Remetente (WhatsApp)</th>
                  <th className="py-3 px-4">Instância</th>
                  <th className="py-3 px-4">Mensagem Recebida</th>
                  <th className="py-3 px-4">Status IA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      Nenhuma mensagem registrada nos logs até o momento.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono">
                        {new Date(log.created_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-mono font-medium text-slate-200">
                        {formatPhone(log.sender_number)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-mono">
                          {log.target_instance}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-slate-100" title={log.message_body}>
                        "{log.message_body}"
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {log.status === 'SUCCESS' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            SUCESSO
                          </span>
                        )}
                        {log.status === 'USER_NOT_FOUND' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                            NÃO CADASTRADO
                          </span>
                        )}
                        {log.status === 'PRO_REQUIRED' && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30 text-[10px] font-bold">
                            PLANO PRO REQ.
                          </span>
                        )}
                        {log.status === 'PARSING_ERROR' && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                            ERRO INTERPRETAÇÃO
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: QR CODE SCANNER */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={handleCloseQrModal} />

          <div className="relative w-full max-w-md bg-[#0b1120] border border-slate-700/80 rounded-3xl p-6 shadow-2xl z-10 animate-slide-up text-center">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white">Conectar WhatsApp</h3>
                  <p className="text-[11px] text-slate-400">{selectedInstance?.label}</p>
                </div>
              </div>
              <button onClick={handleCloseQrModal} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* QR Content */}
            <div className="py-6 flex flex-col items-center justify-center">
              {qrLoading ? (
                <div className="w-64 h-64 flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-slate-800">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                  <p className="text-xs text-slate-400 mt-4">Gerando QR Code no Evolution Go...</p>
                </div>
              ) : qrCodeData?.base64 ? (
                <div className="relative group">
                  <div className="w-64 h-64 p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                    <img
                      src={
                        qrCodeData.base64.startsWith('data:')
                          ? qrCodeData.base64
                          : `data:image/png;base64,${qrCodeData.base64}`
                      }
                      alt="WhatsApp QR Code"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>

                  {/* Pulsing connection monitor */}
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Aguardando leitura pelo WhatsApp no celular...</span>
                  </div>
                </div>
              ) : qrCodeData?.pairingCode ? (
                <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800 max-w-xs">
                  <p className="text-xs text-slate-400">Código de Pareamento:</p>
                  <p className="text-2xl font-mono font-bold text-emerald-400 tracking-wider my-3">
                    {qrCodeData.pairingCode}
                  </p>
                </div>
              ) : (
                <div className="w-64 h-64 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-800 border-t-emerald-500 animate-spin" />
                  <p className="text-xs font-bold text-white mt-4">Iniciando sessão do WhatsApp...</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    O gateway Evolution API está estabelecendo o socket Baileys. O QR Code surgirá aqui em instantes.
                  </p>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left text-xs text-slate-300 space-y-2 max-w-sm">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-emerald-400" />
                  Como conectar:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-400">
                  <li>Abra o **WhatsApp** no celular</li>
                  <li>Toque em **Configurações / Aparelhos Conectados**</li>
                  <li>Toque em **Conectar um aparelho** e aponte para o QR Code acima</li>
                </ol>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleCloseQrModal}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: NOVA INSTÂNCIA */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#0b1120] border border-slate-700/80 rounded-3xl p-6 shadow-2xl z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-white">Criar Nova Instância WhatsApp</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nome da Instância (Identificador Slug)
                </label>
                <Input
                  placeholder="ex: din-finance-03"
                  value={createForm.instance_name}
                  onChange={(e) => setCreateForm({ ...createForm, instance_name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Apenas letras, números, hífen ou sublinhado.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rótulo / Título de Exibição
                </label>
                <Input
                  placeholder="ex: Linha de Atendimento Principal"
                  value={createForm.label}
                  onChange={(e) => setCreateForm({ ...createForm, label: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número do WhatsApp (com DDI e DDD)
                </label>
                <Input
                  placeholder="ex: 5586999998888"
                  value={createForm.phone_number}
                  onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">Ex: 55 (Brasil) + DDD + Número</p>
              </div>

              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Exibir no Dashboard dos Usuários</p>
                  <p className="text-[10px] text-slate-400">Disponibiliza o botão para os usuários salvarem o contato.</p>
                </div>
                <input
                  type="checkbox"
                  checked={createForm.is_active}
                  onChange={(e) => setCreateForm({ ...createForm, is_active: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={formSubmitting} className="bg-emerald-500 text-slate-950 font-bold">
                  {formSubmitting ? 'Criando...' : 'Criar Instância'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: EDITAR INSTÂNCIA */}
      {isEditModalOpen && selectedInstance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />

          <div className="relative w-full max-w-md bg-[#0b1120] border border-slate-700/80 rounded-3xl p-6 shadow-2xl z-10 animate-slide-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Editar Instância</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{selectedInstance.instance_name}</p>
                </div>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="py-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Rótulo / Título de Exibição
                </label>
                <Input
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número de Telefone (WhatsApp)
                </label>
                <Input
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <p className="text-xs font-bold text-white">Visível no Dashboard do Usuário</p>
                  <p className="text-[10px] text-slate-400">Se ativo, aparece no dashboard de todos os usuários.</p>
                </div>
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-5 h-5 accent-emerald-500 cursor-pointer rounded"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={formSubmitting} className="bg-emerald-500 text-slate-950 font-bold">
                  {formSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
