export interface DispatchOptions {
    userId?: string;
    daysAhead?: number;
    force?: boolean;
}
export interface DispatchResult {
    success: boolean;
    totalUsersChecked: number;
    notificationsSent: number;
    details: Array<{
        userId: string;
        userName: string;
        billsCount: number;
        channels: string[];
        status: 'sent' | 'skipped' | 'failed';
        reason?: string;
    }>;
}
export declare class BillsNotificationService {
    /**
     * Obtém a lista de contas a vencer para um usuário específico
     */
    getDueBillsForUser(userId: string, daysAhead?: number): Promise<{
        allBills: ({
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                color: string;
                icon: string;
                initial_balance: import("@prisma/client/runtime/library").Decimal;
                is_default: boolean;
            } | null;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                created_at: Date;
                user_id: string | null;
                color: string;
                icon: string;
            } | null;
        } & {
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transaction_id: string | null;
            due_date: Date;
            paid_date: Date | null;
            barcode: string | null;
            notes: string | null;
            is_recurring: boolean;
            installment_number: number | null;
            total_installments: number | null;
            group_id: string | null;
            contact_id: string | null;
        })[];
        overdue: ({
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                color: string;
                icon: string;
                initial_balance: import("@prisma/client/runtime/library").Decimal;
                is_default: boolean;
            } | null;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                created_at: Date;
                user_id: string | null;
                color: string;
                icon: string;
            } | null;
        } & {
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transaction_id: string | null;
            due_date: Date;
            paid_date: Date | null;
            barcode: string | null;
            notes: string | null;
            is_recurring: boolean;
            installment_number: number | null;
            total_installments: number | null;
            group_id: string | null;
            contact_id: string | null;
        })[];
        dueToday: ({
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                color: string;
                icon: string;
                initial_balance: import("@prisma/client/runtime/library").Decimal;
                is_default: boolean;
            } | null;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                created_at: Date;
                user_id: string | null;
                color: string;
                icon: string;
            } | null;
        } & {
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transaction_id: string | null;
            due_date: Date;
            paid_date: Date | null;
            barcode: string | null;
            notes: string | null;
            is_recurring: boolean;
            installment_number: number | null;
            total_installments: number | null;
            group_id: string | null;
            contact_id: string | null;
        })[];
        upcoming: ({
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                color: string;
                icon: string;
                initial_balance: import("@prisma/client/runtime/library").Decimal;
                is_default: boolean;
            } | null;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                created_at: Date;
                user_id: string | null;
                color: string;
                icon: string;
            } | null;
        } & {
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            amount: import("@prisma/client/runtime/library").Decimal;
            transaction_id: string | null;
            due_date: Date;
            paid_date: Date | null;
            barcode: string | null;
            notes: string | null;
            is_recurring: boolean;
            installment_number: number | null;
            total_installments: number | null;
            group_id: string | null;
            contact_id: string | null;
        })[];
        totalCount: number;
        totalAmount: number;
    }>;
    /**
     * Formata a mensagem de lembrete
     */
    formatNotificationMessage(userName: string, data: Awaited<ReturnType<typeof this.getDueBillsForUser>>): string;
    /**
     * Envia a notificação para os canais disponíveis do usuário (Telegram e/ou WhatsApp)
     */
    sendNotification(user: {
        id: string;
        name: string;
        phone_number: string | null;
        telegram_id: string | null;
    }, message: string): Promise<{
        sent: boolean;
        sentChannels: string[];
        errors: string[];
    }>;
    /**
     * Processamento e despacho de notificações de contas a vencer
     */
    dispatchDueBillNotifications(options?: DispatchOptions): Promise<DispatchResult>;
    /**
     * Inicializa o scheduler de verificação periódica de contas (executado em background)
     */
    initScheduledBillNotifier(): void;
}
export declare const billsNotificationService: BillsNotificationService;
