import { prisma } from '../../lib/prisma.js';
import { redis } from '../../lib/redis.js';
import {
  CreateTransactionInput,
  UpdateTransactionInput,
  QueryTransactionsInput,
  CreateTransferInput,
} from './transactions.schemas.js';
import { TransactionOrigin, TransactionType, Prisma, AccountType } from '@prisma/client';

export class TransactionsService {
  private async invalidateUserCache(userId: string) {
    try {
      const keys = await redis.keys(`summary:${userId}:*`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (e) {
      // Falha silenciosa do cache
    }
  }

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
    if (targetAccountId) {
      const acc = await prisma.account.findFirst({
        where: { id: targetAccountId, user_id: userId },
      });
      if (!acc) {
        throw { statusCode: 400, message: 'Conta bancária informada não encontrada ou não pertence ao seu usuário.' };
      }
    } else {
      const defaultAcc = await this.getDefaultAccount(userId);
      targetAccountId = defaultAcc.id;
    }

    if (data.category_id) {
      const cat = await prisma.category.findFirst({
        where: {
          id: data.category_id,
          OR: [{ user_id: userId }, { user_id: null }],
        },
      });
      if (!cat) {
        throw { statusCode: 400, message: 'Categoria informada não encontrada ou inválida.' };
      }
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

    await this.invalidateUserCache(userId);

    return {
      ...transaction,
      amount: Number(transaction.amount),
    };
  }

  async createTransfer(userId: string, data: CreateTransferInput) {
    if (data.from_account_id === data.to_account_id) {
      throw { statusCode: 400, message: 'A conta de origem e destino não podem ser as mesmas.' };
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.account.findFirst({ where: { id: data.from_account_id, user_id: userId } }),
      prisma.account.findFirst({ where: { id: data.to_account_id, user_id: userId } }),
    ]);

    if (!fromAccount) {
      throw { statusCode: 404, message: 'Conta de origem não encontrada.' };
    }
    if (!toAccount) {
      throw { statusCode: 404, message: 'Conta de destino não encontrada.' };
    }

    const txDate = data.date ? new Date(data.date) : new Date();
    const baseDesc = data.description?.trim() || `Transferência: ${fromAccount.name} ➔ ${toAccount.name}`;

    const [expenseTx, incomeTx] = await prisma.$transaction([
      prisma.transaction.create({
        data: {
          user_id: userId,
          account_id: fromAccount.id,
          description: `Saída: ${baseDesc}`,
          amount: data.amount,
          type: TransactionType.EXPENSE,
          origin: TransactionOrigin.MANUAL,
          date: txDate,
        },
      }),
      prisma.transaction.create({
        data: {
          user_id: userId,
          account_id: toAccount.id,
          description: `Entrada: ${baseDesc}`,
          amount: data.amount,
          type: TransactionType.INCOME,
          origin: TransactionOrigin.MANUAL,
          date: txDate,
        },
      }),
    ]);

    await this.invalidateUserCache(userId);

    return {
      message: 'Transferência realizada com sucesso!',
      from: { ...expenseTx, amount: Number(expenseTx.amount) },
      to: { ...incomeTx, amount: Number(incomeTx.amount) },
    };
  }

  async update(userId: string, transactionId: string, data: UpdateTransactionInput) {
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!existing || existing.user_id !== userId) {
      throw { statusCode: 404, message: 'Transação não encontrada.' };
    }

    if (data.account_id) {
      const acc = await prisma.account.findFirst({
        where: { id: data.account_id, user_id: userId },
      });
      if (!acc) {
        throw { statusCode: 400, message: 'Conta bancária informada não encontrada ou não pertence ao seu usuário.' };
      }
    }

    if (data.category_id) {
      const cat = await prisma.category.findFirst({
        where: {
          id: data.category_id,
          OR: [{ user_id: userId }, { user_id: null }],
        },
      });
      if (!cat) {
        throw { statusCode: 400, message: 'Categoria informada não encontrada ou inválida.' };
      }
    }

    const updated = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.type && { type: data.type }),
        ...(data.account_id !== undefined && { account_id: data.account_id }),
        ...(data.category_id !== undefined && { category_id: data.category_id }),
        ...(data.date && { date: new Date(data.date) }),
      },
      include: {
        category: true,
        account: true,
      },
    });

    await this.invalidateUserCache(userId);

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

    await this.invalidateUserCache(userId);

    return { message: 'Transação excluída com sucesso.' };
  }

  async getSummary(userId: string, targetMonth?: number, targetYear?: number) {
    const now = new Date();
    const month = targetMonth !== undefined ? targetMonth - 1 : now.getMonth(); // 0-indexed
    const year = targetYear !== undefined ? targetYear : now.getFullYear();

    const cacheKey = `summary:${userId}:${year}:${month}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Falha silenciosa do cache
    }

    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    // Mês anterior para cálculo de variação
    const prevMonthDate = new Date(year, month - 1, 1);
    const startOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    const endOfPrevMonth = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    // Janela dos últimos 6 meses (início do período)
    const sixMonthsAgo = new Date(year, month - 5, 1);

    // ─── Parallelizar todas as queries independentes ────────────────────────
    const [
      currentMonthTransactions,
      prevMonthTransactions,
      allUserTransactions,
      userAccounts,
      recentTransactions,
      sixMonthsRaw,
    ] = await Promise.all([
      // 1. Transações do mês selecionado (com categoria e conta)
      prisma.transaction.findMany({
        where: { user_id: userId, date: { gte: startOfMonth, lte: endOfMonth } },
        include: { category: true, account: true },
      }),
      // 2. Transações do mês anterior (só tipo e valor)
      prisma.transaction.findMany({
        where: { user_id: userId, date: { gte: startOfPrevMonth, lte: endOfPrevMonth } },
        select: { type: true, amount: true },
      }),
      // 3. Todas as transações históricas (tipo e valor) para saldo total
      prisma.transaction.findMany({
        where: { user_id: userId },
        select: { type: true, amount: true },
      }),
      // 4. Contas bancárias (saldo inicial)
      prisma.account.findMany({ where: { user_id: userId } }),
      // 5. Últimas 5 transações
      prisma.transaction.findMany({
        where: { user_id: userId },
        include: {
          category: { select: { id: true, name: true, icon: true, color: true } },
          account: { select: { id: true, name: true, icon: true, color: true } },
        },
        orderBy: { date: 'desc' },
        take: 5,
      }),
      // 6. Todos os últimos 6 meses em uma única query
      prisma.transaction.findMany({
        where: { user_id: userId, date: { gte: sixMonthsAgo, lte: endOfMonth } },
        select: { type: true, amount: true, date: true },
      }),
    ]);

    // ─── Cálculos Mês Atual ─────────────────────────────────────────────────
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
          categoryTotals[catName] = { name: catName, amount: 0, color: catColor, icon: catIcon, count: 0 };
        }
        categoryTotals[catName].amount += amount;
        categoryTotals[catName].count += 1;
      }
    }

    // ─── Cálculos Mês Anterior ──────────────────────────────────────────────
    let prevIncome = 0;
    let prevExpense = 0;
    for (const t of prevMonthTransactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) prevIncome += amount;
      else prevExpense += amount;
    }

    // ─── Saldo Total Histórico ──────────────────────────────────────────────
    let totalHistoricalBalance = 0;
    for (const acc of userAccounts) totalHistoricalBalance += Number(acc.initial_balance);
    for (const t of allUserTransactions) {
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) totalHistoricalBalance += amount;
      else totalHistoricalBalance -= amount;
    }

    // ─── Histórico Mensal: Agrupar os 6 meses a partir da query única ───────
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const monthlyMap: Record<string, { income: number; expense: number }> = {};

    for (const t of sixMonthsRaw) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`; // 0-indexed month
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
      const amount = Number(t.amount);
      if (t.type === TransactionType.INCOME) monthlyMap[key].income += amount;
      else monthlyMap[key].expense += amount;
    }

    const monthlyHistory = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(year, month - i, 1);
      const key = `${targetDate.getFullYear()}-${targetDate.getMonth()}`;
      const data = monthlyMap[key] || { income: 0, expense: 0 };
      monthlyHistory.push({
        month: monthNames[targetDate.getMonth()],
        year: targetDate.getFullYear(),
        label: `${monthNames[targetDate.getMonth()]}/${targetDate.getFullYear().toString().slice(-2)}`,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      });
    }

    // ─── Breakdown por Categoria ────────────────────────────────────────────
    const categoryBreakdown = Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .map((item) => ({
        ...item,
        percentage: currentExpense > 0 ? Number(((item.amount / currentExpense) * 100).toFixed(1)) : 0,
      }));

    const result = {
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

    try {
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 45);
    } catch (e) {
      // Falha silenciosa do cache
    }

    return result;
  }
}
