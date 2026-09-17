import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  X,
  Copy,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
  Ban,
  Clock,
  Zap,
  RefreshCw,
  CreditCard,
  QrCode,
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
  const { refreshUser } = useAuth();

  const [selectedCycle, setSelectedCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutResponse | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reset do estado ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      setCheckoutData(null);
      setCopiedLink(false);
    }
  }, [isOpen]);

  // Polling automático suave para detectar ativação após pagamento no Asaas
  useEffect(() => {
    if (!isOpen || !checkoutData) return;

    const interval = setInterval(async () => {
      try {
        const sub = await fetchMySubscription();
        if (sub.is_pro) {
          toast.success('🎉 Parabéns! Seu plano Meu Dino PRO foi ativado com sucesso!');
          if (refreshUser) await refreshUser();
          if (onSuccess) onSuccess();
          onClose();
        }
      } catch {
        // Falhas silenciosas no polling de background
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isOpen, checkoutData, refreshUser, onSuccess, onClose, toast]);

  if (!isOpen) return null;

  const handleGenerateCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await createCheckout({
        plan_cycle: selectedCycle,
        billing_type: 'UNDEFINED',
      });
      setCheckoutData(res);

      const targetUrl = res.url || res.invoice_url;
      if (targetUrl) {
        // Abre o checkout oficial do Asaas em uma nova aba
        const win = window.open(targetUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          toast.info('Link do Asaas gerado! Clique em "Abrir Página de Pagamento" para prosseguir.');
        } else {
          toast.success('Página de pagamento aberta em nova aba no Asaas!');
        }
      } else {
        toast.success('Fatura gerada com sucesso!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || err.message || 'Falha ao gerar link de pagamento no Asaas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    const targetUrl = checkoutData?.url || checkoutData?.invoice_url;
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setCopiedLink(true);
    toast.success('Link do checkout Asaas copiado para a área de transferência!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCheckStatus = async () => {
    setIsCheckingPayment(true);
    try {
      const sub = await fetchMySubscription();
      if (sub.is_pro) {
        toast.success('🎉 Parabéns! Seu plano Meu Dino PRO já está ativo!');
        if (refreshUser) await refreshUser();
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.info('Pagamento ainda em processamento. Se já realizou o PIX ou Cartão, aguarde alguns instantes.');
      }
    } catch {
      toast.error('Erro ao verificar status. Tente novamente em instantes.');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const currentPrice = selectedCycle === 'YEARLY' ? 'R$ 199,00' : 'R$ 19,90';
  const currentPeriod = selectedCycle === 'YEARLY' ? '/ano' : '/mês';
  const checkoutUrl = checkoutData?.url || checkoutData?.invoice_url;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com gradiente */}
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
              Meu Dino PRO
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
                    className={`p-3.5 rounded-2xl border text-left transition-all min-h-[44px] flex flex-col justify-between touch-manipulation ${
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
                    className={`p-3.5 rounded-2xl border text-left transition-all min-h-[44px] flex flex-col justify-between relative overflow-hidden touch-manipulation ${
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

              {/* Informações sobre Formas de Pagamento Asaas */}
              <div className="p-3.5 rounded-2xl bg-card-secondary/80 border border-border flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-din-text">Pagamento Seguro via Gateway Asaas</span>
                </div>
                <p className="text-[11px] text-din-muted leading-relaxed">
                  Você será direcionado para o checkout oficial do Asaas com suporte instantâneo a{' '}
                  <strong className="text-emerald-400 font-semibold">PIX (QR Code dinâmico e Copia e Cola)</strong>,{' '}
                  <strong className="text-violet-300 font-semibold">Cartão de Crédito</strong> e Boleto.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs text-din-muted font-medium">
                  <span className="flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" /> PIX
                  </span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-violet-400" /> Cartão
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" /> Boleto
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleGenerateCheckout}
                  isLoading={isLoading}
                  className="w-full min-h-[48px] text-sm font-bold shadow-lg shadow-violet-500/20 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border-none touch-manipulation"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ir para Pagamento no Asaas ({currentPrice}{currentPeriod})
                </Button>
              </div>
            </>
          ) : (
            /* Tela após criação da cobrança no Asaas */
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-card-secondary border border-border text-center space-y-2">
                <span className="text-xs text-din-muted font-medium">Fatura Gerada com Sucesso</span>
                <p className="text-3xl font-black text-din-text">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    checkoutData.amount
                  )}
                </p>
                <div className="flex items-center justify-center gap-1.5 text-xs text-din-muted">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  <span>Vencimento em {checkoutData.due_date}</span>
                </div>
              </div>

              {/* Card de Ação Principal: Link do Asaas */}
              {checkoutUrl && (
                <div className="p-4 rounded-2xl bg-card-secondary/90 border border-violet-500/30 space-y-3">
                  <div className="text-center">
                    <p className="text-xs font-bold text-din-text">
                      Página de Pagamento Oficial Asaas
                    </p>
                    <p className="text-[11px] text-din-muted mt-1 leading-relaxed">
                      Conclua seu pagamento com segurança via <strong>PIX</strong>, <strong>Cartão de Crédito</strong> ou <strong>Boleto</strong> diretamente no Asaas.
                    </p>
                  </div>

                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 transition-all touch-manipulation"
                  >
                    <span>Abrir Página de Pagamento Asaas</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <Button
                    variant="secondary"
                    onClick={handleCopyLink}
                    className="w-full min-h-[44px] text-xs font-bold touch-manipulation"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-400 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2 text-din-muted" />
                    )}
                    <span>{copiedLink ? 'Link do Checkout Copiado!' : 'Copiar Link do Checkout Asaas'}</span>
                  </Button>
                </div>
              )}

              {/* Botões de Checagem e Retorno */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <Button
                  variant="primary"
                  onClick={handleCheckStatus}
                  isLoading={isCheckingPayment}
                  className="w-full sm:flex-1 min-h-[46px] font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 touch-manipulation"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isCheckingPayment ? 'animate-spin' : ''}`} />
                  Já Paguei! Verificar Ativação
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setCheckoutData(null)}
                  className="w-full sm:w-auto min-h-[44px] text-xs text-din-muted touch-manipulation"
                >
                  Alterar Plano
                </Button>
              </div>

              <p className="text-[11px] text-din-muted text-center leading-relaxed">
                Assim que o pagamento for compensado pelo gateway Asaas, seu plano Meu Dino PRO será ativado de forma 100% automática.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
