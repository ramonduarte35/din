import { Prisma } from '@prisma/client';
import { CreateReceivableInput, UpdateReceivableInput, ReceiveReceivableInput, ListReceivablesQueryInput } from './receivables.schemas.js';
export declare class ReceivablesService {
    /**
     * Criar nova conta a receber (com suporte a parcelamento automático)
     */
    createReceivable(userId: string, data: CreateReceivableInput): Promise<{
        account: {
            type: import("@prisma/client").$Enums.AccountType;
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            color: string;
            icon: string;
            initial_balance: Prisma.Decimal;
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
        contact: {
            type: import("@prisma/client").$Enums.ContactType;
            name: string;
            id: string;
            email: string | null;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            notes: string | null;
            document: string | null;
            phone: string | null;
        } | null;
    } & {
        status: import("@prisma/client").$Enums.ReceivableStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        account_id: string | null;
        category_id: string | null;
        description: string;
        amount: Prisma.Decimal;
        transaction_id: string | null;
        due_date: Date;
        notes: string | null;
        is_recurring: boolean;
        installment_number: number | null;
        total_installments: number | null;
        group_id: string | null;
        contact_id: string | null;
        received_date: Date | null;
    }>;
    /**
     * Listar contas a receber com filtros e paginação
     */
    listReceivables(userId: string, query: ListReceivablesQueryInput): Promise<{
        receivables: {
            amount: number;
            computed_status: import("@prisma/client").$Enums.ReceivableStatus;
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                color: string;
                icon: string;
                initial_balance: Prisma.Decimal;
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
            transaction: {
                type: import("@prisma/client").$Enums.TransactionType;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                account_id: string | null;
                category_id: string | null;
                description: string;
                amount: Prisma.Decimal;
                date: Date;
                origin: import("@prisma/client").$Enums.TransactionOrigin;
                received_on_number: string | null;
                raw_message: string | null;
            } | null;
            contact: {
                type: import("@prisma/client").$Enums.ContactType;
                name: string;
                id: string;
                email: string | null;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                notes: string | null;
                document: string | null;
                phone: string | null;
            } | null;
            status: import("@prisma/client").$Enums.ReceivableStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            transaction_id: string | null;
            due_date: Date;
            notes: string | null;
            is_recurring: boolean;
            installment_number: number | null;
            total_installments: number | null;
            group_id: string | null;
            contact_id: string | null;
            received_date: Date | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * KPIs de contas a receber
     */
    getReceivableSummary(userId: string, month?: number, year?: number): Promise<{
        month: number;
        year: number;
        total_pending: {
            amount: number;
            count: number;
        };
        total_overdue: {
            amount: number;
            count: number;
        };
        total_received: {
            amount: number;
            count: number;
        };
        upcoming_receivables: any[];
    }>;
    /**
     * Obter conta a receber por ID
     */
    getReceivableById(userId: string, id: string): Promise<{
        amount: number;
        computed_status: import("@prisma/client").$Enums.ReceivableStatus;
        account: {
            type: import("@prisma/client").$Enums.AccountType;
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            color: string;
            icon: string;
            initial_balance: Prisma.Decimal;
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
        transaction: {
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            amount: Prisma.Decimal;
            date: Date;
            origin: import("@prisma/client").$Enums.TransactionOrigin;
            received_on_number: string | null;
            raw_message: string | null;
        } | null;
        contact: {
            type: import("@prisma/client").$Enums.ContactType;
            name: string;
            id: string;
            email: string | null;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            notes: string | null;
            document: string | null;
            phone: string | null;
        } | null;
        status: import("@prisma/client").$Enums.ReceivableStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        account_id: string | null;
        category_id: string | null;
        description: string;
        transaction_id: string | null;
        due_date: Date;
        notes: string | null;
        is_recurring: boolean;
        installment_number: number | null;
        total_installments: number | null;
        group_id: string | null;
        contact_id: string | null;
        received_date: Date | null;
    }>;
    /**
     * Atualizar conta a receber
     */
    updateReceivable(userId: string, id: string, data: UpdateReceivableInput): Promise<{
        account: {
            type: import("@prisma/client").$Enums.AccountType;
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            color: string;
            icon: string;
            initial_balance: Prisma.Decimal;
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
        transaction: {
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            amount: Prisma.Decimal;
            date: Date;
            origin: import("@prisma/client").$Enums.TransactionOrigin;
            received_on_number: string | null;
            raw_message: string | null;
        } | null;
        contact: {
            type: import("@prisma/client").$Enums.ContactType;
            name: string;
            id: string;
            email: string | null;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            notes: string | null;
            document: string | null;
            phone: string | null;
        } | null;
    } & {
        status: import("@prisma/client").$Enums.ReceivableStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        account_id: string | null;
        category_id: string | null;
        description: string;
        amount: Prisma.Decimal;
        transaction_id: string | null;
        due_date: Date;
        notes: string | null;
        is_recurring: boolean;
        installment_number: number | null;
        total_installments: number | null;
        group_id: string | null;
        contact_id: string | null;
        received_date: Date | null;
    }>;
    /**
     * Marcar como recebido: credita na conta bancária e gera transação INCOME
     */
    receiveReceivable(userId: string, id: string, data: ReceiveReceivableInput): Promise<{
        receivable: {
            amount: number;
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                color: string;
                icon: string;
                initial_balance: Prisma.Decimal;
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
            transaction: {
                type: import("@prisma/client").$Enums.TransactionType;
                id: string;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                account_id: string | null;
                category_id: string | null;
                description: string;
                amount: Prisma.Decimal;
                date: Date;
                origin: import("@prisma/client").$Enums.TransactionOrigin;
                received_on_number: string | null;
                raw_message: string | null;
            } | null;
            contact: {
                type: import("@prisma/client").$Enums.ContactType;
                name: string;
                id: string;
                email: string | null;
                created_at: Date;
                updated_at: Date;
                user_id: string;
                notes: string | null;
                document: string | null;
                phone: string | null;
            } | null;
            status: import("@prisma/client").$Enums.ReceivableStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            transaction_id: string | null;
            due_date: Date;
            notes: string | null;
            is_recurring: boolean;
            installment_number: number | null;
            total_installments: number | null;
            group_id: string | null;
            contact_id: string | null;
            received_date: Date | null;
        };
        transaction: {
            amount: number;
            type: import("@prisma/client").$Enums.TransactionType;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            date: Date;
            origin: import("@prisma/client").$Enums.TransactionOrigin;
            received_on_number: string | null;
            raw_message: string | null;
        };
        credited_account: {
            id: string;
            name: string;
        };
    }>;
    /**
     * Desfazer recebimento: restaura para PENDING e exclui a transação de crédito
     */
    unreceiveReceivable(userId: string, id: string): Promise<{
        amount: number;
        account: {
            type: import("@prisma/client").$Enums.AccountType;
            name: string;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            color: string;
            icon: string;
            initial_balance: Prisma.Decimal;
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
        contact: {
            type: import("@prisma/client").$Enums.ContactType;
            name: string;
            id: string;
            email: string | null;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            notes: string | null;
            document: string | null;
            phone: string | null;
        } | null;
        status: import("@prisma/client").$Enums.ReceivableStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        account_id: string | null;
        category_id: string | null;
        description: string;
        transaction_id: string | null;
        due_date: Date;
        notes: string | null;
        is_recurring: boolean;
        installment_number: number | null;
        total_installments: number | null;
        group_id: string | null;
        contact_id: string | null;
        received_date: Date | null;
    }>;
    /**
     * Excluir conta a receber
     */
    deleteReceivable(userId: string, id: string, scope?: 'SINGLE' | 'ALL'): Promise<{
        success: boolean;
        deleted: number;
        message: string;
    }>;
}
