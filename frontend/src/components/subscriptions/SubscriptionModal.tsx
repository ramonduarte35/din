import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  X,
  QrCode,
  Copy,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Ban,
  Clock,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  createCheckout,
  fetchMySubscription,
  CheckoutResponse,
} from '../../api/subscriptions';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const { user, refreshUser } = useAuth();

  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCheckoutData(null);
      setCopiedPix(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await createCheckout({
        plan_cycle: selectedCycle,
        billing_type: selectedMethod === 'PIX' ? 'PIX' : 'UNDEFINED',
      });
      setCheckoutData(res);
      toast.success(
        selectedMethod === 'PIX'
          ? 'Cobrança PIX gerada com sucesso!'
          : 'Link de pagamento seguro gerado!'
      );
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Falha ao gerar cobrança');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPix = () => {
    if (!checkoutData?.pix_copy_paste) return;
    navigator.clipboard.writeText(checkoutData.pix_copy_paste);
    setCopiedPix(true);
    toast.success('Chave Copia e Cola PIX copiada para a área de transferência!');
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handleCheckStatus = async () => {
    setIsCheckingPayment(true);
    try {
      const sub = await fetchMySubscription();
      if (sub.is_pro) {
        toast.success('🎉 Parabéns! Seu plano Din PRO já está ativo!');
        if (refreshUser) await refreshUser();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.info('Pagamento ainda em processamento. Se já realizou o PIX, aguarde alguns instantes.');
      }
    } catch {
      toast.error('Erro ao verificar status. Tente novamente em instantes.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente sutil */}
        <div className="relative p-5 sm:p-6 pb-4 bg-gradient-to-br from-violet-600/15 via-indigo-600/10 to-transparent border-b border-border/60">
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-4 right-4 p-2.5 rounded-full text-din-muted hover:text-din-text hover:bg-card-secondary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
              <Sparkles className="w-5 h-5" />
            </span>
            <Badge variant="pro" className="text-xs px-2.5 py-0.5 font-bold">
              Din PRO
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-din-text tracking-tight">
            Desbloqueie o Máximo Potencial
          </h2>
          <p className="text-xs sm:text-sm text-din-muted mt-1">
            Liberdade total no WhatsApp, transcrição de áudios com IA e experiência 100% sem anúncios.
          </p>
        </div>

        {/* Corpo do Modal */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {!checkoutData ? (
            <>
              {/* Benefícios em destaque */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 rounded-2xl bg-card-secondary/70 border border-border/70 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-din-text">WhatsApp Ilimitado</p>
                    <p className="text-[11px] text-din-muted leading-tight mt-0.5">
                      Gaste e lance por áudios de voz e texto com IA direto no WhatsApp.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card-secondary/70 border border-border/70 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-din-text">100% Sem Anúncios</p>
                    <p className="text-[11px] text-din-muted leading-tight mt-0.5">
                      Navegação limpa e veloz no painel web, zero propagandas.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card-secondary/70 border border-border/70 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-din-text">Áudio Whisper OpenAI</p>
                    <p className="text-[11px] text-din-muted leading-tight mt-0.5">
                      Reconhecimento preciso de gastos em linguagem natural falada.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-card-secondary/70 border border-border/70 flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-din-text">Telegram Incluso</p>
                    <p className="text-[11px] text-din-muted leading-tight mt-0.5">
                      Acesso simultâneo aos dois canais sem limitação.
                    </p>
                  </div>
                </div>
              </div>

              {/* Seletor de Ciclo de Assinatura */}
              <div>
                <label className="block text-xs font-bold text-din-text mb-2 uppercase tracking-wider">
                  Escolha o Período
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedCycle('MONTHLY')}
                    className={`p-3.5 rounded-2xl border text-left transition-all min-h-[44px] flex flex-col justify-between ${
                      selectedCycle === 'MONTHLY'
                        ? 'bg-violet-600/10 border-violet-500 ring-2 ring-violet-500/30'
                        : 'bg-card-secondary border-border hover:border-violet-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-din-text">Plano Mensal</span>
                      {selectedCycle === 'MONTHLY' && (
                        <Check className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-din-text">R$ 19,90</span>
                      <span className="text-xs text-din-muted">/mês</span>
                    </div>
                    <span className="text-[11px] text-din-muted mt-1">Cancele quando quiser</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedCycle('YEARLY')}
                    className={`p-3.5 rounded-2xl border text-left transition-all min-h-[44px] flex flex-col justify-between relative overflow-hidden ${
                      selectedCycle === 'YEARLY'
                        ? 'bg-violet-600/10 border-violet-500 ring-2 ring-violet-500/30'
                        : 'bg-card-secondary border-border hover:border-violet-500/40'
                    }`}
                  >
                    <span className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[9px] uppercase px-2 py-0.5 rounded-bl-lg">
                      -17% OFF
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-din-text">Plano Anual</span>
                      {selectedCycle === 'YEARLY' && (
                        <Check className="w-4 h-4 text-violet-400" />
                      )}
                    </div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-400">R$ 199,00</span>
                      <span className="text-xs text-din-muted">/ano</span>
                    </div>
                    <span className="text-[11px] text-emerald-400/90 mt-1 font-semibold">
                      Equivale a R$ 16,58/mês
                    </span>
                  </button>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div>
                <label className="block text-xs font-bold text-din-text mb-2 uppercase tracking-wider">
                  Forma de Pagamento (Gateway Asaas)
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('PIX')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all min-h-[44px] ${
                      selectedMethod === 'PIX'
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-card-secondary border-border text-din-muted hover:text-din-text'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>PIX Instantâneo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('CREDIT_CARD')}
                    className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all min-h-[44px] ${
                      selectedMethod === 'CREDIT_CARD'
                        ? 'bg-violet-600/15 border-violet-500 text-violet-300 ring-2 ring-violet-500/30'
                        : 'bg-card-secondary border-border text-din-muted hover:text-din-text'
                    }`}
                  >
                    <span>Cartão / Boleto</span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleGenerateCheckout}
                  isLoading={isLoading}
                  className="w-full min-h-[48px] text-sm font-bold shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ir para Pagamento com {selectedMethod === 'PIX' ? 'PIX' : 'Asaas'}
                </Button>
              </div>
            </>
          ) : (
            /* Tela com os dados gerados do Asaas */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-card-secondary border border-border text-center space-y-2">
                <span className="text-xs text-din-muted font-medium">Valor Total a Pagar</span>
                <p className="text-3xl font-black text-din-text">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    checkoutData.amount
                  )}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-din-muted">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Vencimento em {checkoutData.due_date}</span>
                </div>
              </div>

              {/* Se tiver QR Code PIX */}
              {checkoutData.pix_qr_code && (
                <div className="p-4 rounded-2xl bg-card-secondary/80 border border-emerald-500/30 flex flex-col items-center text-center space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" />
                    Escaneie o QR Code PIX
                  </span>

                  <div className="p-3 bg-white rounded-2xl shadow-md inline-block">
                    <img
                      src={`data:image/png;base64,${checkoutData.pix_qr_code}`}
                      alt="QR Code PIX Asaas"
                      className="w-48 h-48 object-contain"
                    />
                  </div>

                  {checkoutData.pix_copy_paste && (
                    <div className="w-full space-y-2">
                      <p className="text-[11px] text-din-muted">Ou pague com o código Copia e Cola:</p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={checkoutData.pix_copy_paste}
                          className="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono text-din-muted truncate"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCopyPix}
                          className="min-h-[44px] px-4 shrink-0 font-bold"
                        >
                          {copiedPix ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Link externo para Fatura Asaas (se for cartão ou boleto) */}
              {checkoutData.invoice_url && (
                <div className="p-3 rounded-xl bg-card-secondary border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-center sm:text-left">
                    <p className="text-xs font-bold text-din-text">Fatura Online Asaas</p>
                    <p className="text-[11px] text-din-muted">
                      Pague diretamente no checkout protegido com Cartão ou Boleto.
                    </p>
                  </div>
                  <a
                    href={checkoutData.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-all shadow-md min-h-[44px]"
                  >
                    <span>Abrir Fatura</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleCheckStatus}
                  isLoading={isCheckingPayment}
                  className="w-full sm:flex-1 min-h-[44px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Já Paguei! Verificar Ativação
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setCheckoutData(null)}
                  className="w-full sm:w-auto min-h-[44px] text-xs text-din-muted"
                >
                  Voltar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
