import { CreateAccountInput, UpdateAccountInput } from './accounts.schemas.js';
export declare class AccountsService {
    ensureDefaultAccount(userId: string): Promise<{
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
    }>;
    list(userId: string): Promise<{
        initial_balance: number;
        current_balance: number;
        month_income: number;
        month_expense: number;
        month_balance: number;
        transactions_count: number;
        type: import("@prisma/client").$Enums.AccountType;
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        is_default: boolean;
    }[]>;
    getById(userId: string, id: string): Promise<{
        initial_balance: number;
        current_balance: number;
        recent_transactions: {
            amount: number;
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
        }[];
        type: import("@prisma/client").$Enums.AccountType;
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        is_default: boolean;
    }>;
    create(userId: string, data: CreateAccountInput): Promise<{
        initial_balance: number;
        current_balance: number;
        month_income: number;
        month_expense: number;
        month_balance: number;
        transactions_count: number;
        type: import("@prisma/client").$Enums.AccountType;
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        is_default: boolean;
    }>;
    update(userId: string, id: string, data: UpdateAccountInput): Promise<{
        initial_balance: number;
        type: import("@prisma/client").$Enums.AccountType;
        name: string;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        color: string;
        icon: string;
        is_default: boolean;
    }>;
    delete(userId: string, id: string): Promise<{
        message: string;
    }>;
}
