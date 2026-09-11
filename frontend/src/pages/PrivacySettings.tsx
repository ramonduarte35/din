/**
 * @file PrivacySettings.tsx
 * @description Tela de Gerenciamento de Privacidade e Dados (LGPD).
 *
 * Direitos implementados (LGPD Art. 18):
 * - Portabilidade: exportação de todos os dados em JSON
 * - Esquecimento: anonimização dos dados pessoais
 * - Informação: visualização dos consentimentos ativos
 *
 * Dados fiscais (transações, boletos) são mantidos por 5 anos por obrigação legal.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Download, Trash2, ArrowLeft,
  CheckCircle2, AlertTriangle, ToggleRight, ToggleLeft,
  FileText, Clock,
} from 'lucide-react';
import {
  getConsents,
  requestDataExport,
  requestForgetMe,
  type ConsentRecord,
  type ActiveTerm,
} from '../api/privacy';
import { useAuth } from '../contexts/AuthContext';

type ActionState = 'idle' | 'loading' | 'success' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export function PrivacySettings() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [exportState, setExportState]     = useState<ActionState>('idle');
  const [deleteState, setDeleteState]     = useState<ActionState>('idle');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason]   = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [consents, setConsents]           = useState<ConsentRecord[]>([]);
  const [activeTerm, setActiveTerm]       = useState<ActiveTerm | null>(null);
  const [loadingConsents, setLoadingConsents] = useState(true);

  useEffect(() => {
    getConsents()
      .then(({ consents: c, activeTerm: t }) => {
        setConsents(c);
        setActiveTerm(t);
      })
      .catch(() => {})
      .finally(() => setLoadingConsents(false));
  }, []);

  const activeConsent = consents.find((c) => c.isActive);

  const handleExport = async () => {
    setExportState('loading');
    try {
      await requestDataExport();
      setExportState('success');
    } catch {
      setExportState('error');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'CONFIRMAR_EXCLUSAO') return;
    setDeleteState('loading');
    try {
      await requestForgetMe(deleteReason || undefined);
      setDeleteState('success');
      // Aguardar 2s para exibir confirmação antes de deslogar
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch {
      setDeleteState('error');
    }
  };

  return (
    <div className="min-h-screen bg-background text-din-text pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors min-h-[44px] px-1"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-2 font-bold text-sm">
            <Shield size={18} className="text-emerald-400" />
            <span>Privacidade e Dados</span>
          </div>
          <div className="w-16" aria-hidden="true" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* Título */}
        <div className="space-y-1 pb-2">
          <h1 className="text-lg font-bold text-white">Seus Dados & Privacidade</h1>
          <p className="text-xs text-gray-500">
            Gerencie seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018).
          </p>
        </div>

        {/* Card: Exportar dados */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Download size={18} className="text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white">Exportar meus dados</h2>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Receba uma cópia completa dos seus dados em formato JSON.
                A entrega é feita por e-mail em até{' '}
                <strong className="text-gray-300">72 horas</strong>{' '}
                (prazo legal: 15 dias — LGPD Art. 18, §3º).
              </p>
            </div>
          </div>

          {exportState === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300">
                Solicitação enviada! Você receberá os dados no seu e-mail em até 72 horas.
              </p>
            </div>
          )}
          {exportState === 'error' && (
            <p className="text-xs text-red-400 px-1">Erro ao enviar solicitação. Tente novamente.</p>
          )}

          <button
            id="btn-export-data"
            type="button"
            onClick={handleExport}
            disabled={exportState === 'loading' || exportState === 'success'}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors min-h-[44px] w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {exportState === 'loading' ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Solicitando...
              </span>
            ) : exportState === 'success' ? (
              <><CheckCircle2 size={14} /> Solicitado com sucesso</>
            ) : (
              <><Download size={14} /> Solicitar exportação de dados</>
            )}
          </button>
        </section>

        {/* Card: Consentimentos ativos */}
        <section className="bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-purple-500/10 rounded-xl border border-purple-500/20">
              <FileText size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Consentimentos</h2>
              {activeTerm && (
                <p className="mt-0.5 text-xs text-gray-500">Termo ativo: v{activeTerm.version}</p>
              )}
            </div>
          </div>

          {loadingConsents ? (
            <div className="h-16 flex items-center justify-center">
              <span className="w-5 h-5 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : activeConsent ? (
            <div className="space-y-2">
              {Object.entries(activeConsent.optInTypes).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2.5 px-3 bg-gray-900/60 rounded-xl border border-gray-800"
                >
                  <div>
                    <span className="text-xs font-medium text-gray-300 capitalize">{key}</span>
                    {key === 'essential' && (
                      <span className="ml-2 text-[10px] text-gray-600">(obrigatório)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <ToggleRight size={20} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={20} className="text-gray-600" />
                    )}
                    <span className={`text-[11px] font-medium ${value ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {value ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-1.5 pt-1 px-1">
                <Clock size={12} className="text-gray-600" />
                <p className="text-[11px] text-gray-600">
                  Aceito em {new Date(activeConsent.consentedAt).toLocaleDateString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500 text-center py-3">
              Nenhum consentimento registrado. Aceite os termos para registrar suas preferências.
            </p>
          )}
        </section>

        {/* Card: Zona de perigo — Excluir conta */}
        <section className="bg-card border border-red-900/40 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 p-2 bg-red-500/10 rounded-xl border border-red-500/20">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">Excluir minha conta</h2>
              <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                Seus dados pessoais (nome, e-mail, telefone) serão{' '}
                <strong className="text-gray-300">anonimizados permanentemente</strong>.
                Dados financeiros são mantidos por 5 anos por exigência fiscal (CTN, art. 195).
              </p>
            </div>
          </div>

          <button
            id="btn-delete-account"
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-red-400 border border-red-800/60 hover:bg-red-900/20 rounded-xl transition-colors min-h-[44px] w-full sm:w-auto"
          >
            <AlertTriangle size={14} />
            Solicitar exclusão da conta
          </button>
        </section>

      </main>

      {/* Modal de confirmação */}
      {showDeleteModal && (
        <DeleteModal
          confirm={deleteConfirm}
          reason={deleteReason}
          state={deleteState}
          onChangeConfirm={setDeleteConfirm}
          onChangeReason={setDeleteReason}
          onDelete={handleDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteConfirm('');
            setDeleteReason('');
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-componente: Modal de exclusão
// ─────────────────────────────────────────────────────────────────────────────

interface DeleteModalProps {
  confirm:          string;
  reason:           string;
  state:            ActionState;
  onChangeConfirm:  (v: string) => void;
  onChangeReason:   (v: string) => void;
  onDelete:         () => void;
  onClose:          () => void;
}

function DeleteModal({
  confirm, reason, state, onChangeConfirm, onChangeReason, onDelete, onClose,
}: DeleteModalProps) {
  const isValid = confirm === 'CONFIRMAR_EXCLUSAO';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirmar exclusão de conta"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={state === 'loading' ? undefined : onClose}
      />
      <div className="relative w-full max-w-sm bg-gray-950 border border-red-900/60 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Barra de perigo */}
        <div className="h-1 w-full bg-gradient-to-r from-red-700 via-rose-500 to-red-700" />

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <h3 className="text-sm font-bold text-white">Confirmar exclusão permanente</h3>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            Esta ação é <strong className="text-white">irreversível</strong>.
            Seus dados pessoais serão anonimizados imediatamente e você será desconectado.
          </p>

          <div className="p-3 bg-red-950/40 border border-red-900/40 rounded-xl">
            <p className="text-[11px] text-red-300 font-medium mb-1">Para confirmar, digite exatamente:</p>
            <code className="text-sm text-red-400 font-mono">CONFIRMAR_EXCLUSAO</code>
          </div>

          {/* Campo de confirmação */}
          <input
            id="delete-confirm-input"
            type="text"
            value={confirm}
            onChange={(e) => onChangeConfirm(e.target.value)}
            placeholder="Digite o texto acima"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="w-full px-3 py-3 bg-gray-900 border border-gray-700 focus:border-red-600 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-red-600 font-mono transition-colors text-base"
            aria-label="Campo de confirmação de exclusão"
          />

          {/* Motivo (opcional) */}
          <div>
            <label htmlFor="delete-reason" className="text-xs text-gray-500 mb-1.5 block">
              Motivo da exclusão <span className="text-gray-700">(opcional)</span>
            </label>
            <textarea
              id="delete-reason"
              value={reason}
              onChange={(e) => onChangeReason(e.target.value)}
              placeholder="Conte-nos por quê está saindo..."
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>

          {/* Status messages */}
          {state === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-900/20 border border-emerald-800/40 rounded-xl">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <p className="text-xs text-emerald-300">Conta excluída. Redirecionando...</p>
            </div>
          )}
          {state === 'error' && (
            <p className="text-xs text-red-400 px-1">Erro ao processar. Tente novamente em alguns instantes.</p>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={state === 'loading'}
              className="flex-1 py-2.5 text-xs font-semibold text-gray-400 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-xl transition-colors min-h-[44px] disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              id="btn-confirm-delete"
              type="button"
              onClick={onDelete}
              disabled={!isValid || state === 'loading' || state === 'success'}
              className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-600 rounded-xl transition-colors min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {state === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Excluindo...
                </span>
              ) : 'Excluir conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
