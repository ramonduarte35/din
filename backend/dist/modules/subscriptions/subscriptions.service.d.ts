import { CheckoutInput, AsaasWebhookPayload } from './subscriptions.schemas.js';
export declare class SubscriptionsService {
    /**
     * Retorna os planos disponíveis e preços vigentes
     */
    getAvailablePlans(): ({
        id: string;
        name: string;
        cycle: string;
        price: number;
        period: string;
        popular: boolean;
        features: string[];
        badge?: undefined;
    } | {
        id: string;
        name: string;
        cycle: string;
        price: number;
        period: string;
        popular: boolean;
        badge: string;
        features: string[];
    })[];
    /**
     * Obtém o status da assinatura do usuário, verificando expiração automaticamente
     */
    getMySubscription(userId: string): Promise<{
        tier: import("@prisma/client").$Enums.SubscriptionTier;
        status: import("@prisma/client").$Enums.SubscriptionStatus;
        expires_at: Date | null;
        days_remaining: number | null;
        is_pro: boolean;
        telegram_linked: boolean;
        whatsapp_configured: boolean;
        recent_payments: {
            status: import("@prisma/client").$Enums.PaymentStatus;
            id: string;
            asaas_subscription_id: string | null;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            description: string | null;
            amount: import("@prisma/client/runtime/library").Decimal;
            due_date: Date | null;
            asaas_payment_id: string;
            net_amount: import("@prisma/client/runtime/library").Decimal | null;
            billing_type: import("@prisma/client").$Enums.PaymentBillingType;
            payment_date: Date | null;
            client_payment_date: Date | null;
            invoice_url: string | null;
            bank_slip_url: string | null;
            pix_qr_code: string | null;
            pix_copy_paste: string | null;
            raw_payload: import("@prisma/client/runtime/library").JsonValue | null;
        }[];
    }>;
    /**
     * Inicia o fluxo de checkout e geração de cobrança no Asaas via Payment Links
     */
    createCheckout(userId: string, input: CheckoutInput): Promise<{
        payment_id: string;
        asaas_payment_id: string;
        amount: number;
        due_date: string;
        url: string;
        invoice_url: string;
    }>;
    /**
     * Processa Webhooks recebidos da API do Asaas
     */
    processAsaasWebhook(payload: AsaasWebhookPayload): Promise<{
        status: string;
        asaas_payment_id?: undefined;
        event?: undefined;
    } | {
        status: string;
        asaas_payment_id: string;
        event?: undefined;
    } | {
        status: string;
        event: string;
        asaas_payment_id: string;
    }>;
}
export declare const subscriptionsService: SubscriptionsService;
