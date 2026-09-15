import { UpsertBudgetInput, UpdateBudgetInput, CopyBudgetsInput } from './budgets.schemas.js';
export declare class BudgetsService {
    /**
     * Lista os orçamentos do mês/ano com métricas agregadas de gastos reais
     */
    getMonthlyBudgets(userId: string, month?: number, year?: number): Promise<{
        month: number;
        year: number;
        summary: {
            total_budgeted: number;
            total_spent: number;
            total_remaining: number;
            overall_percentage: number;
            total_all_expenses: number;
            budgeted_categories_count: number;
            available_categories_count: number;
        };
        budgets: {
            id: string;
            category_id: string;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                created_at: Date;
                user_id: string | null;
                color: string;
                icon: string;
            };
            budgeted_amount: number;
            spent_amount: number;
            remaining_amount: number;
            percentage: number;
            status: "NORMAL" | "WARNING" | "DANGER" | "EXCEEDED";
            month: number;
            year: number;
            created_at: Date;
            updated_at: Date;
        }[];
        available_categories: {
            type: import("@prisma/client").$Enums.CategoryType;
            name: string;
            id: string;
            created_at: Date;
            user_id: string | null;
            color: string;
            icon: string;
        }[];
    }>;
    /**
     * Salva ou atualiza um orçamento de categoria (Upsert)
     */
    upsertBudget(userId: string, data: UpsertBudgetInput): Promise<{
        amount: number;
        category: {
            type: import("@prisma/client").$Enums.CategoryType;
            name: string;
            id: string;
            created_at: Date;
            user_id: string | null;
            color: string;
            icon: string;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        category_id: string;
        month: number;
        year: number;
    }>;
    /**
     * Atualiza valor de um orçamento existente
     */
    updateBudget(userId: string, budgetId: string, data: UpdateBudgetInput): Promise<{
        amount: number;
        category: {
            type: import("@prisma/client").$Enums.CategoryType;
            name: string;
            id: string;
            created_at: Date;
            user_id: string | null;
            color: string;
            icon: string;
        };
        id: string;
        created_at: Date;
        updated_at: Date;
        user_id: string;
        category_id: string;
        month: number;
        year: number;
    }>;
    /**
     * Exclui um orçamento configurado
     */
    deleteBudget(userId: string, budgetId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    /**
     * Copia todos os orçamentos do mês anterior para o mês alvo
     */
    copyFromPreviousMonth(userId: string, data: CopyBudgetsInput): Promise<{
        copied_count: number;
        from_month: number;
        from_year: number;
        target_month: number;
        target_year: number;
        budgets: {
            amount: number;
            category: {
                type: import("@prisma/client").$Enums.CategoryType;
                name: string;
                id: string;
                created_at: Date;
                user_id: string | null;
                color: string;
                icon: string;
            };
            id: string;
            created_at: Date;
            updated_at: Date;
            user_id: string;
            category_id: string;
            month: number;
            year: number;
        }[];
    }>;
    /**
     * Verifica se uma categoria ultrapassou ou está próxima do teto de orçamento após um lançamento
     */
    checkCategoryBudgetAlert(userId: string, categoryId: string, transactionDate?: Date): Promise<{
        has_budget: boolean;
        category_name: string;
        budgeted_amount: number;
        total_spent: number;
        remaining_amount: number;
        percentage: number;
        is_exceeded: boolean;
        is_warning: boolean;
    } | null>;
}
