import { Prisma } from '@prisma/client';
import { CreateBillInput, UpdateBillInput, PayBillInput, ListBillsQueryInput } from './bills.schemas';
export declare class BillsService {
    /**
     * Criar uma nova conta a pagar
     */
    createBill(userId: string, data: CreateBillInput): Promise<{
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
    } & {
        status: import("@prisma/client").$Enums.BillStatus;
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
        paid_date: Date | null;
        barcode: string | null;
        notes: string | null;
        is_recurring: boolean;
    }>;
    /**
     * Listar contas a pagar com filtros e paginação
     */
    listBills(userId: string, query: ListBillsQueryInput): Promise<{
        bills: {
            amount: number;
            computed_status: import("@prisma/client").$Enums.BillStatus;
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
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            transaction_id: string | null;
            due_date: Date;
            paid_date: Date | null;
            barcode: string | null;
            notes: string | null;
            is_recurring: boolean;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    /**
     * Obter resumo / KPIs de contas a pagar
     */
    getBillSummary(userId: string, month?: number, year?: number): Promise<{
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
        total_paid: {
            amount: number;
            count: number;
        };
        upcoming_bills: any[];
    }>;
    /**
     * Obter conta por ID
     */
    getBillById(userId: string, id: string): Promise<{
        amount: number;
        computed_status: import("@prisma/client").$Enums.BillStatus;
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
        status: import("@prisma/client").$Enums.BillStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        account_id: string | null;
        category_id: string | null;
        description: string;
        transaction_id: string | null;
        due_date: Date;
        paid_date: Date | null;
        barcode: string | null;
        notes: string | null;
        is_recurring: boolean;
    }>;
    /**
     * Atualizar conta a pagar
     */
    updateBill(userId: string, id: string, data: UpdateBillInput): Promise<{
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
    } & {
        status: import("@prisma/client").$Enums.BillStatus;
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
        paid_date: Date | null;
        barcode: string | null;
        notes: string | null;
        is_recurring: boolean;
    }>;
    /**
     * Pagar conta: debita da conta bancária escolhida e gera a transação de despesa
     */
    payBill(userId: string, id: string, data: PayBillInput): Promise<{
        bill: {
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
            status: import("@prisma/client").$Enums.BillStatus;
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            account_id: string | null;
            category_id: string | null;
            description: string;
            transaction_id: string | null;
            due_date: Date;
            paid_date: Date | null;
            barcode: string | null;
            notes: string | null;
            is_recurring: boolean;
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
        debited_account: {
            id: string;
            name: string;
        };
    }>;
    /**
     * Desfazer pagamento: restaura para PENDING e exclui a transação de despesa criada
     */
    unpayBill(userId: string, id: string): Promise<{
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
        status: import("@prisma/client").$Enums.BillStatus;
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        account_id: string | null;
        category_id: string | null;
        description: string;
        transaction_id: string | null;
        due_date: Date;
        paid_date: Date | null;
        barcode: string | null;
        notes: string | null;
        is_recurring: boolean;
    }>;
    /**
     * Excluir conta a pagar
     */
    deleteBill(userId: string, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
