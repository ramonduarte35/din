import { prisma } from '../../lib/prisma.js';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  QueryTransactionsInput,
} from './transactions.schemas.js';
import { TransactionOrigin, TransactionType, Prisma, AccountType } from '@prisma/client';

export class TransactionsService {
  private async getDefaultAccount(userId: string) {
    let account = await prisma.account.findFirst({
      where: { user_id: userId, is_default: true },
    });

    if (!account) {
      account = await prisma.account.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'asc' },
      });
    }

    if (!account) {
      account = await prisma.account.create({
        data: {
          user_id: userId,
          name: 'Conta Principal',
          type: AccountType.CHECKING,
          color: '#10b981',
          icon: 'Landmark',
          initial_balance: 0,
          is_default: true,
        },
      });
    }

    return account;
  }

  async list(userId: string, query: QueryTransactionsInput) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      user_id: userId,
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.category_id) {
      where.category_id = query.category_id;
    }

    if (query.account_id) {
      where.account_id = query.account_id;
    }

    if (query.origin) {
      where.origin = query.origin;
    }

    if (query.search) {
      where.description = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    if (query.start_date || query.end_date) {
      where.date = {};
      if (query.start_date) {
        where.date.gte = new Date(query.start_date);
      }
      if (query.end_date) {
        // Final do dia
        const end = new Date(query.end_date);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
              color: true,
              type: true,
            },
          },
          account: {
            select: {
              id: true,
              name: true,
              type: true,
              color: true,
              icon: true,
            },
          },
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      transactions: transactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createManual(userId: string, data: CreateTransactionInput) {
    let targetAccountId = data.account_id;
    if (!targetAccountId) {
      const defaultAcc = await this.getDefaultAccount(userId);
      targetAccountId = defaultAcc.id;
    }

    const transaction = await prisma.transaction.create({
      data: {
        user_id: userId,
        description: data.description,
        amount: data.amount,
        type: data.type,
        account_id: targetAccountId,
        category_id: data.category_id || null,
        date: data.date ? new Date(data.date) : new Date(),
        origin: TransactionOrigin.MANUAL,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  async update(userId: string, transactionId: string, data: UpdateTransactionInput) {
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing || existing.user_id !== userId) {
      throw { statusCode: 404, message: 'Transação não encontrada.' };
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        description: data.description,
        amount: data.amount,
        type: data.type,
        account_id: data.account_id !== undefined ? data.account_id : existing.account_id,
        category_id: data.category_id !== undefined ? data.category_id : existing.category_id,
        date: data.date ? new Date(data.date) : existing.date,
      },
      include: {
        category: true,
        account: true,
      },
    });

    return {
      ...updated,
      amount: Number(updated.amount),
    };
  }

  async delete(userId: string, transactionId: string) {
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing || existing.user_id !== userId) {
      throw { statusCode: 404, message: 'Transação não encontrada.' };
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    return { message: 'Transação excluída com sucesso.' };
  }

  async getSummary(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Mês anterior para cálculo de variação
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Agregações do mês atual
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        category: true,
        account: true,
      },
    });

    // Agregações do mês anterior
    const prevMonthTransactions = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
      },
    });

    // Cálculos Mês Atual
    let currentIncome = 0;
    let currentExpense = 0;
    const categoryTotals: Record<
      string,
      { name: string; amount: number; color: string; icon: string; count: number }
    > = {};

    for (const t of currentMonthTransactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) {
        currentIncome += amount;
      } else {
        currentExpense += amount;
        const catName = t.category?.name || 'Sem Categoria';
        const catColor = t.category?.color || '#94a3b8';
        const catIcon = t.category?.icon || 'Tag';

        if (!categoryTotals[catName]) {
          categoryTotals[catName] = {
            name: catName,
            amount: 0,
            color: catColor,
            icon: catIcon,
            count: 0,
          };
        }
        categoryTotals[catName].amount += amount;
        categoryTotals[catName].count += 1;
      }
    }

    // Cálculos Mês Anterior
    let prevIncome = 0;
    let prevExpense = 0;
    for (const t of prevMonthTransactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) prevIncome += amount;
      else prevExpense += amount;
    }

    // Saldo Total Geral Histórico do Usuário (incluindo saldo inicial de todas as contas)
    const [allUserTransactions, userAccounts] = await Promise.all([
      prisma.transaction.findMany({
        where: { user_id: userId },
        select: { type: true, amount: true },
      }),
      prisma.account.findMany({
        where: { user_id: userId },
      }),
    ]);

    let totalHistoricalBalance = 0;
    for (const acc of userAccounts) {
      totalHistoricalBalance += Number(acc.initial_balance);
    }
    for (const t of allUserTransactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) totalHistoricalBalance += amount;
      else totalHistoricalBalance -= amount;
    }

    // Histórico dos últimos 6 meses
    const monthlyHistory = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const mEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const mTransactions = await prisma.transaction.findMany({
        where: {
          user_id: userId,
          date: { gte: mStart, lte: mEnd },
        },
        select: { type: true, amount: true },
      });

      let mIncome = 0;
      let mExpense = 0;
      for (const t of mTransactions) {
        const amt = Number(t.amount);
        if (t.type === TransactionType.INCOME) mIncome += amt;
        else mExpense += amt;
      }

      monthlyHistory.push({
        month: monthNames[targetDate.getMonth()],
        year: targetDate.getFullYear(),
        label: `${monthNames[targetDate.getMonth()]}/${targetDate.getFullYear().toString().slice(-2)}`,
        income: mIncome,
        expense: mExpense,
        balance: mIncome - mExpense,
      });
    }

    // 5 transações mais recentes
    const recentTransactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        account: {
          select: { id: true, name: true, icon: true, color: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // Breakdown por categoria ordenado por valor decrescente
    const categoryBreakdown = Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        percentage: currentExpense > 0 ? Number(((item.amount / currentExpense) * 100).toFixed(1)) : 0,
      }));

    return {
      current_month: {
        income: currentIncome,
        expense: currentExpense,
        balance: currentIncome - currentExpense,
        transactions_count: currentMonthTransactions.length,
      },
      previous_month: {
        income: prevIncome,
        expense: prevExpense,
        balance: prevIncome - prevExpense,
      },
      total_balance: totalHistoricalBalance,
      category_breakdown: categoryBreakdown,
      monthly_history: monthlyHistory,
      recent_transactions: recentTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
    };
  }
}
