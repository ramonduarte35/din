import { CreateTransactionInput, UpdateTransactionInput, QueryTransactionsInput, CreateTransferInput } from './transactions.schemas.js';
import { Prisma } from '@prisma/client';
export declare class TransactionsService {
    private invalidateUserCache;
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
    createTransfer(userId: string, data: CreateTransferInput): Promise<{
        message: string;
        from: {
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
        to: {
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
    getSummary(userId: string, targetMonth?: number, targetYear?: number): Promise<any>;
}
