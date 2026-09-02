import { CreateTransactionInput, UpdateTransactionInput, QueryTransactionsInput } from './transactions.schemas.js';
import { Prisma } from '@prisma/client';
export declare class TransactionsService {
    private getDefaultAccount;
    list(userId: string, query: QueryTransactionsInput): Promise<{
        transactions: {
            amount: number;
            account: {
                type: import("@prisma/client").$Enums.AccountType;
                name: string;
                id: string;
                color: string;
                icon: string;
            } | null;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                color: string;
                icon: string;
            } | null;
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
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    createManual(userId: string, data: CreateTransactionInput): Promise<{
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
    }>;
    update(userId: string, transactionId: string, data: UpdateTransactionInput): Promise<{
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
    }>;
    delete(userId: string, transactionId: string): Promise<{
        message: string;
    }>;
    getSummary(userId: string): Promise<{
        current_month: {
            income: number;
            expense: number;
            balance: number;
            transactions_count: number;
        };
        previous_month: {
            income: number;
            expense: number;
            balance: number;
        };
        total_balance: number;
        category_breakdown: {
            percentage: number;
            name: string;
            amount: number;
            color: string;
            icon: string;
            count: number;
        }[];
        monthly_history: {
            month: string;
            year: number;
            label: string;
            income: number;
            expense: number;
            balance: number;
        }[];
        recent_transactions: {
            amount: number;
            account: {
                name: string;
                id: string;
                color: string;
                icon: string;
            } | null;
            category: {
                name: string;
                id: string;
                color: string;
                icon: string;
            } | null;
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
        }[];
    }>;
}
