import { prisma } from '../../lib/prisma.js';
import { CategoryType, TransactionType } from '@prisma/client';
import {
  UpsertBudgetInput,
  UpdateBudgetInput,
  CopyBudgetsInput,
} from './budgets.schemas.js';

export class BudgetsService {
  /**
   * Lista os orçamentos do mês/ano com métricas agregadas de gastos reais
   */
  async getMonthlyBudgets(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // 1. Buscar todas as despesas do usuário no mês
    const expenses = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        category_id: true,
        amount: true,
      },
    });

    const spentByCategory: Record<string, number> = {};
    let totalSpentAllExpenses = 0;

    for (const exp of expenses) {
      const amt = Number(exp.amount);
      totalSpentAllExpenses += amt;
      if (exp.category_id) {
        spentByCategory[exp.category_id] = (spentByCategory[exp.category_id] || 0) + amt;
      }
    }

    // 2. Buscar orçamentos configurados para este mês
    const budgets = await prisma.budget.findMany({
      where: {
        user_id: userId,
        month: targetMonth,
        year: targetYear,
      },
      include: {
        category: true,
      },
      orderBy: {
        category: {
          name: 'asc',
        },
      },
    });

    // 3. Buscar todas as categorias de despesa disponíveis para o usuário
    const allExpenseCategories = await prisma.category.findMany({
      where: {
        OR: [{ user_id: userId }, { user_id: null }],
        type: CategoryType.EXPENSE,
      },
      orderBy: {
        name: 'asc',
      },
    });

    let totalBudgeted = 0;
    let totalSpentInBudgetedCategories = 0;

    const formattedBudgets = budgets.map((b) => {
      const budgetedAmount = Number(b.amount);
      const spentAmount = spentByCategory[b.category_id] || 0;
      const remainingAmount = budgetedAmount - spentAmount;
      const percentage = budgetedAmount > 0 ? Math.round((spentAmount / budgetedAmount) * 100) : 0;

      totalBudgeted += budgetedAmount;
      totalSpentInBudgetedCategories += spentAmount;

      let status: 'NORMAL' | 'WARNING' | 'DANGER' | 'EXCEEDED' = 'NORMAL';
      if (percentage > 100) {
        status = 'EXCEEDED';
      } else if (percentage >= 90) {
        status = 'DANGER';
      } else if (percentage >= 70) {
        status = 'WARNING';
      }

      return {
        id: b.id,
        category_id: b.category_id,
        category: b.category,
        budgeted_amount: budgetedAmount,
        spent_amount: spentAmount,
        remaining_amount: remainingAmount,
        percentage,
        status,
        month: b.month,
        year: b.year,
        created_at: b.created_at,
        updated_at: b.updated_at,
      };
    });

    const budgetedCategoryIds = new Set(budgets.map((b) => b.category_id));
    const availableCategories = allExpenseCategories.filter((c) => !budgetedCategoryIds.has(c.id));

    const overallPercentage =
      totalBudgeted > 0 ? Math.round((totalSpentInBudgetedCategories / totalBudgeted) * 100) : 0;

    return {
      month: targetMonth,
      year: targetYear,
      summary: {
        total_budgeted: totalBudgeted,
        total_spent: totalSpentInBudgetedCategories,
        total_remaining: totalBudgeted - totalSpentInBudgetedCategories,
        overall_percentage: overallPercentage,
        total_all_expenses: totalSpentAllExpenses,
        budgeted_categories_count: formattedBudgets.length,
        available_categories_count: availableCategories.length,
      },
      budgets: formattedBudgets,
      available_categories: availableCategories,
    };
  }

  /**
   * Salva ou atualiza um orçamento de categoria (Upsert)
   */
  async upsertBudget(userId: string, data: UpsertBudgetInput) {
    const category = await prisma.category.findFirst({
      where: {
        id: data.category_id,
        OR: [{ user_id: userId }, { user_id: null }],
        type: CategoryType.EXPENSE,
      },
    });

    if (!category) {
      throw { statusCode: 404, message: 'Categoria de despesa não encontrada.' };
    }

    const budget = await prisma.budget.upsert({
      where: {
        user_id_category_id_month_year: {
          user_id: userId,
          category_id: data.category_id,
          month: data.month,
          year: data.year,
        },
      },
      update: {
        amount: data.amount,
      },
      create: {
        user_id: userId,
        category_id: data.category_id,
        amount: data.amount,
        month: data.month,
        year: data.year,
      },
      include: {
        category: true,
      },
    });

    return {
      ...budget,
      amount: Number(budget.amount),
    };
  }

  /**
   * Atualiza valor de um orçamento existente
   */
  async updateBudget(userId: string, budgetId: string, data: UpdateBudgetInput) {
    const existing = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existing || existing.user_id !== userId) {
      throw { statusCode: 404, message: 'Orçamento não encontrado.' };
    }

    const updated = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        amount: data.amount,
      },
      include: {
        category: true,
      },
    });

    return {
      ...updated,
      amount: Number(updated.amount),
    };
  }

  /**
   * Exclui um orçamento configurado
   */
  async deleteBudget(userId: string, budgetId: string) {
    const existing = await prisma.budget.findUnique({
      where: { id: budgetId },
    });

    if (!existing || existing.user_id !== userId) {
      throw { statusCode: 404, message: 'Orçamento não encontrado.' };
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return { success: true, message: 'Orçamento removido com sucesso.' };
  }

  /**
   * Copia todos os orçamentos do mês anterior para o mês alvo
   */
  async copyFromPreviousMonth(userId: string, data: CopyBudgetsInput) {
    const targetMonth = data.target_month;
    const targetYear = data.target_year;

    const prevMonth = targetMonth === 1 ? 12 : targetMonth - 1;
    const prevYear = targetMonth === 1 ? targetYear - 1 : targetYear;

    const prevBudgets = await prisma.budget.findMany({
      where: {
        user_id: userId,
        month: prevMonth,
        year: prevYear,
      },
    });

    if (prevBudgets.length === 0) {
      throw {
        statusCode: 400,
        message: `Nenhum orçamento encontrado no mês anterior (${String(prevMonth).padStart(2, '0')}/${prevYear}) para copiar.`,
      };
    }

    const createdOrUpdated = [];

    for (const pb of prevBudgets) {
      const budget = await prisma.budget.upsert({
        where: {
          user_id_category_id_month_year: {
            user_id: userId,
            category_id: pb.category_id,
            month: targetMonth,
            year: targetYear,
          },
        },
        update: {
          amount: pb.amount,
        },
        create: {
          user_id: userId,
          category_id: pb.category_id,
          amount: pb.amount,
          month: targetMonth,
          year: targetYear,
        },
        include: {
          category: true,
        },
      });

      createdOrUpdated.push({
        ...budget,
        amount: Number(budget.amount),
      });
    }

    return {
      copied_count: createdOrUpdated.length,
      from_month: prevMonth,
      from_year: prevYear,
      target_month: targetMonth,
      target_year: targetYear,
      budgets: createdOrUpdated,
    };
  }

  /**
   * Verifica se uma categoria ultrapassou ou está próxima do teto de orçamento após um lançamento
   */
  async checkCategoryBudgetAlert(userId: string, categoryId: string, transactionDate: Date = new Date()) {
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    const budget = await prisma.budget.findUnique({
      where: {
        user_id_category_id_month_year: {
          user_id: userId,
          category_id: categoryId,
          month,
          year,
        },
      },
      include: {
        category: true,
      },
    });

    if (!budget) {
      return null;
    }

    const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const totalSpentRes = await prisma.transaction.aggregate({
      where: {
        user_id: userId,
        category_id: categoryId,
        type: TransactionType.EXPENSE,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = Number(totalSpentRes._sum.amount || 0);
    const budgetedAmount = Number(budget.amount);
    const percentage = budgetedAmount > 0 ? Math.round((totalSpent / budgetedAmount) * 100) : 0;
    const remaining = budgetedAmount - totalSpent;

    return {
      has_budget: true,
      category_name: budget.category.name,
      budgeted_amount: budgetedAmount,
      total_spent: totalSpent,
      remaining_amount: remaining,
      percentage,
      is_exceeded: percentage > 100,
      is_warning: percentage >= 80 && percentage <= 100,
    };
  }
}
