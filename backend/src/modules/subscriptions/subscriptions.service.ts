import { prisma } from '../../lib/prisma.js';
import { asaasClient } from '../../lib/asaas.client.js';
import { CheckoutInput, AsaasWebhookPayload } from './subscriptions.schemas.js';
import {
  SubscriptionTier,
  SubscriptionStatus,
  PaymentBillingType,
  PaymentStatus,
} from '@prisma/client';

export class SubscriptionsService {
  /**
   * Retorna os planos disponíveis e preços vigentes
   */
  getAvailablePlans() {
    return [
      {
        id: 'pro_monthly',
        name: 'Din PRO Mensal',
        cycle: 'MONTHLY',
        price: 19.9,
        period: '/mês',
        popular: true,
        features: [
          'Assistente Inteligente no WhatsApp (Áudio Whisper & Texto)',
          '100% Livre de Anúncios e Banners no Painel Web',
          'Acesso Completo ao Robô no Telegram',
          'Lançamentos Ilimitados com IA gpt-4o-mini',
          'Contas a Pagar & Receber com Contatos PF/PJ',
          'Orçamentos, Metas e Simulador de Gastos',
          'App PWA no Celular e Computador',
        ],
      },
      {
        id: 'pro_yearly',
        name: 'Din PRO Anual',
        cycle: 'YEARLY',
        price: 199.0,
        period: '/ano',
        popular: false,
        badge: 'Economize 17% (2 meses grátis)',
        features: [
          'Assistente Inteligente no WhatsApp (Áudio Whisper & Texto)',
          '100% Livre de Anúncios e Banners no Painel Web',
          'Acesso Completo ao Robô no Telegram',
          'Lançamentos Ilimitados com IA gpt-4o-mini',
          'Contas a Pagar & Receber com Contatos PF/PJ',
          'Orçamentos, Metas e Simulador de Gastos',
          'App PWA no Celular e Computador',
          'Suporte Prioritário Exclusivo',
        ],
      },
    ];
  }

  /**
   * Obtém o status da assinatura do usuário, verificando expiração automaticamente
   */
  async getMySubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        payments: {
          orderBy: { created_at: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const now = new Date();
    let currentTier = user.subscription_tier;
    let currentStatus = user.subscription_status;

    // Se é PRO mas a data de expiração já passou, rebaixa para FREE
    if (user.subscription_tier === SubscriptionTier.PRO && user.subscription_expires_at) {
      if (user.subscription_expires_at < now) {
        currentTier = SubscriptionTier.FREE;
        currentStatus = SubscriptionStatus.EXPIRED;

        await prisma.user.update({
          where: { id: userId },
          data: {
            subscription_tier: SubscriptionTier.FREE,
            subscription_status: SubscriptionStatus.EXPIRED,
          },
        });
      }
    }

    let daysRemaining: number | null = null;
    if (user.subscription_expires_at && user.subscription_expires_at > now) {
      const diffTime = user.subscription_expires_at.getTime() - now.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    return {
      tier: currentTier,
      status: currentStatus,
      expires_at: user.subscription_expires_at,
      days_remaining: daysRemaining,
      is_pro: currentTier === SubscriptionTier.PRO,
      telegram_linked: Boolean(user.telegram_id),
      whatsapp_configured: Boolean(user.phone_number),
      recent_payments: user.payments,
    };
  }

  /**
   * Inicia o fluxo de checkout e geração de cobrança no Asaas
   */
  async createCheckout(userId: string, input: CheckoutInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // 1. Obter ou criar cliente no Asaas
    let asaasCustomerId = user.asaas_customer_id;

    if (!asaasCustomerId) {
      const customer = await asaasClient.findOrCreateCustomer({
        name: user.name,
        email: user.email,
        cpfCnpj: input.cpf_cnpj || undefined,
        phone: input.phone || user.phone_number || undefined,
      });

      asaasCustomerId = customer.id;

      await prisma.user.update({
        where: { id: userId },
        data: { asaas_customer_id: asaasCustomerId },
      });
    } else if (input.cpf_cnpj || input.phone) {
      // Atualiza CPF/telefone do cliente pré-existente no Asaas
      await asaasClient
        .updateCustomer(asaasCustomerId, {
          cpfCnpj: input.cpf_cnpj || undefined,
          phone: input.phone || user.phone_number || undefined,
        })
        .catch((err) => {
          console.warn('⚠️ [Subscriptions] Aviso ao atualizar dados do cliente no Asaas:', err.message);
        });
    }

    // 2. Definir valor e vencimento
    const isYearly = input.plan_cycle === 'YEARLY';
    const amount = isYearly ? 199.0 : 19.9;
    const planName = isYearly ? 'Din PRO Anual' : 'Din PRO Mensal';

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 2); // 2 dias de prazo
    const dueDateStr = dueDateObj.toISOString().split('T')[0];

    // 3. Criar cobrança no Asaas
    const payment = await asaasClient.createPayment({
      customerId: asaasCustomerId,
      billingType: input.billing_type,
      value: amount,
      dueDate: dueDateStr,
      description: `Assinatura ${planName} - Usuário: ${user.email}`,
    });

    // 4. Se for PIX ou UNDEFINED, gerar QR Code PIX
    let pixData: { encodedImage?: string; payload?: string; expirationDate?: string } = {};
    if (input.billing_type === 'PIX' || input.billing_type === 'UNDEFINED') {
      try {
        pixData = await asaasClient.getPixQrCode(payment.id);
      } catch (pixErr: any) {
        console.warn('⚠️ [Subscriptions] Não foi possível gerar QR Code PIX imediatamente:', pixErr.message);
      }
    }

    // 5. Salvar registro de pagamento no banco de dados local
    const billingTypeEnum =
      input.billing_type === 'PIX'
        ? PaymentBillingType.PIX
        : input.billing_type === 'CREDIT_CARD'
        ? PaymentBillingType.CREDIT_CARD
        : input.billing_type === 'BOLETO'
        ? PaymentBillingType.BOLETO
        : PaymentBillingType.UNDEFINED;

    const savedPayment = await prisma.subscriptionPayment.create({
      data: {
        user_id: user.id,
        asaas_payment_id: payment.id,
        amount: payment.value,
        net_amount: payment.netValue ?? null,
        billing_type: billingTypeEnum,
        status: PaymentStatus.PENDING,
        due_date: new Date(payment.dueDate),
        invoice_url: payment.invoiceUrl ?? null,
        bank_slip_url: payment.bankSlipUrl ?? null,
        pix_qr_code: pixData.encodedImage ?? null,
        pix_copy_paste: pixData.payload ?? null,
        description: planName,
        raw_payload: payment as any,
      },
    });

    return {
      payment_id: savedPayment.id,
      asaas_payment_id: payment.id,
      amount: payment.value,
      due_date: payment.dueDate,
      invoice_url: payment.invoiceUrl,
      bank_slip_url: payment.bankSlipUrl,
      pix_qr_code: pixData.encodedImage,
      pix_copy_paste: pixData.payload,
      pix_expires_at: pixData.expirationDate,
    };
  }

  /**
   * Processa Webhooks recebidos da API do Asaas
   */
  async processAsaasWebhook(payload: AsaasWebhookPayload) {
    const { event, payment } = payload;
    console.log(`🔔 [Asaas Webhook] Evento recebido: ${event} para cobrança: ${payment.id}`);

    if (!payment?.id) {
      console.warn('⚠️ [Asaas Webhook] Payload sem ID de pagamento.');
      return { status: 'ignored_missing_id' };
    }

    // 1. Tentar localizar o pagamento pelo asaas_payment_id
    let localPayment = await prisma.subscriptionPayment.findUnique({
      where: { asaas_payment_id: payment.id },
      include: { user: true },
    });

    let targetUserId: string | null = localPayment?.user_id || null;

    // 2. Se não achou localmente, tentar achar o usuário pelo customer id do Asaas
    if (!targetUserId && payment.customer) {
      const userByCustomer = await prisma.user.findUnique({
        where: { asaas_customer_id: payment.customer },
      });
      if (userByCustomer) {
        targetUserId = userByCustomer.id;
      }
    }

    if (!targetUserId) {
      console.warn(`⚠️ [Asaas Webhook] Usuário não encontrado para pagamento ${payment.id} / customer ${payment.customer}`);
      return { status: 'user_not_found', asaas_payment_id: payment.id };
    }

    // 3. Atualizar status e vigência com base no evento do Asaas
    const now = new Date();
    const isPaymentSuccess = event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED';
    const isOverdue = event === 'PAYMENT_OVERDUE';
    const isRefunded = event === 'PAYMENT_REFUNDED' || event === 'PAYMENT_DELETED';

    if (isPaymentSuccess) {
      // Determina período da assinatura: se valor >= 150 considera Anual (365 dias), caso contrário Mensal (30 dias)
      const durationDays = payment.value >= 150 ? 365 : 30;

      // Se o usuário já tiver uma data futura válida, estende a partir dela; senão, a partir de agora
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      const baseDate = user?.subscription_expires_at && user.subscription_expires_at > now
        ? new Date(user.subscription_expires_at)
        : new Date(now);

      baseDate.setDate(baseDate.getDate() + durationDays);

      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          subscription_tier: SubscriptionTier.PRO,
          subscription_status: SubscriptionStatus.ACTIVE,
          subscription_expires_at: baseDate,
          asaas_subscription_id: payment.subscription || user?.asaas_subscription_id || null,
        },
      });

      console.log(`⭐ [Asaas Webhook] Usuário ${targetUserId} promovido a PRO até ${baseDate.toISOString()} (+${durationDays} dias).`);
    } else if (isOverdue) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          subscription_status: SubscriptionStatus.PAST_DUE,
        },
      });
      console.log(`⚠️ [Asaas Webhook] Assinatura do usuário ${targetUserId} marcada como PAST_DUE.`);
    } else if (isRefunded) {
      await prisma.user.update({
        where: { id: targetUserId },
        data: {
          subscription_tier: SubscriptionTier.FREE,
          subscription_status: SubscriptionStatus.CANCELED,
        },
      });
      console.log(`↩️ [Asaas Webhook] Pagamento estornado/cancelado. Usuário ${targetUserId} rebaixado para FREE.`);
    }

    // 4. Atualizar ou criar o registro no histórico de pagamentos
    const paymentStatusEnum = isPaymentSuccess
      ? PaymentStatus.RECEIVED
      : isOverdue
      ? PaymentStatus.OVERDUE
      : isRefunded
      ? PaymentStatus.REFUNDED
      : PaymentStatus.PENDING;

    await prisma.subscriptionPayment.upsert({
      where: { asaas_payment_id: payment.id },
      create: {
        user_id: targetUserId,
        asaas_payment_id: payment.id,
        asaas_subscription_id: payment.subscription || null,
        amount: payment.value,
        net_amount: payment.netValue ?? null,
        status: paymentStatusEnum,
        due_date: payment.dueDate ? new Date(payment.dueDate) : null,
        payment_date: payment.paymentDate ? new Date(payment.paymentDate) : isPaymentSuccess ? now : null,
        client_payment_date: payment.clientPaymentDate ? new Date(payment.clientPaymentDate) : null,
        invoice_url: payment.invoiceUrl || null,
        bank_slip_url: payment.bankSlipUrl || null,
        description: payment.description || null,
        raw_payload: payload as any,
      },
      update: {
        status: paymentStatusEnum,
        payment_date: payment.paymentDate ? new Date(payment.paymentDate) : isPaymentSuccess ? now : undefined,
        client_payment_date: payment.clientPaymentDate ? new Date(payment.clientPaymentDate) : undefined,
        net_amount: payment.netValue ?? undefined,
        raw_payload: payload as any,
      },
    });

    return { status: 'processed', event, asaas_payment_id: payment.id };
  }
}

export const subscriptionsService = new SubscriptionsService();
