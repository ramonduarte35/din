import { ManageUserSubscriptionInput, QueryUsersSubscriptionInput } from './admin.subscriptions.schemas.js';
export declare class AdminSubscriptionsService {
    /**
     * Métricas executivas e KPIs de assinaturas e receita
     */
    getOverview(): Promise<{
        total_users: number;
        total_pro_users: number;
        total_free_users: number;
        expiring_soon_users: number;
        estimated_mrr: number;
        total_revenue: number;
        recent_payments: ({
            user: {
                name: string;
                id: string;
                email: string;
                phone_number: string | null;
            };
        } & {
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
        })[];
    }>;
    /**
     * Listagem paginada de usuários com filtros de plano e status
     */
    getUsers(query: QueryUsersSubscriptionInput): Promise<{
        users: {
            days_remaining: number | null;
            is_expired: boolean;
            name: string;
            id: string;
            email: string;
            phone_number: string | null;
            telegram_id: string | null;
            telegram_username: string | null;
            avatar_url: string | null;
            subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
            subscription_status: import("@prisma/client").$Enums.SubscriptionStatus;
            subscription_expires_at: Date | null;
            asaas_customer_id: string | null;
            role: import("@prisma/client").$Enums.Role;
            created_at: Date;
            _count: {
                transactions: number;
                bills: number;
                payments: number;
            };
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Gestão manual de assinatura de um usuário (conceder PRO, alterar validade ou rebaixar para Free)
     */
    manageUserSubscription(userId: string, input: ManageUserSubscriptionInput, actorId?: string): Promise<{
        name: string;
        id: string;
        email: string;
        subscription_tier: import("@prisma/client").$Enums.SubscriptionTier;
        subscription_status: import("@prisma/client").$Enums.SubscriptionStatus;
        subscription_expires_at: Date | null;
    }>;
    /**
     * Histórico detalhado de cobranças do Asaas
     */
    getPayments(page?: number, limit?: number, status?: string): Promise<{
        payments: ({
            user: {
                name: string;
                id: string;
                email: string;
                phone_number: string | null;
            };
        } & {
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
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
export declare const adminSubscriptionsService: AdminSubscriptionsService;
