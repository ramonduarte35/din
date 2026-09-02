import { prisma } from '../../lib/prisma.js';
import { CreateAccountInput, UpdateAccountInput } from './accounts.schemas.js';
import { AccountType, TransactionType } from '@prisma/client';

export class AccountsService {
  async ensureDefaultAccount(userId: string) {
    const existing = await prisma.account.findFirst({
      where: { user_id: userId },
    });

    if (!existing) {
      return await prisma.account.create({
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

    return existing;
  }

  async list(userId: string) {
    await this.ensureDefaultAccount(userId);

    const accounts = await prisma.account.findMany({
      where: { user_id: userId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
    });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Calcular saldos e métricas para cada conta
    const enriched = await Promise.all(
      accounts.map(async (account) => {
        const [allTransactions, monthTransactions] = await Promise.all([
          prisma.transaction.findMany({
            where: { user_id: userId, account_id: account.id },
            select: { type: true, amount: true },
          }),
          prisma.transaction.findMany({
            where: {
              user_id: userId,
              account_id: account.id,
              date: { gte: startOfMonth, lte: endOfMonth },
            },
            select: { type: true, amount: true },
          }),
        ]);

        let totalIncome = 0;
        let totalExpense = 0;
        for (const t of allTransactions) {
          const amt = Number(t.amount);
          if (t.type === TransactionType.INCOME) totalIncome += amt;
          else totalExpense += amt;
        }

        let monthIncome = 0;
        let monthExpense = 0;
        for (const t of monthTransactions) {
          const amt = Number(t.amount);
          if (t.type === TransactionType.INCOME) monthIncome += amt;
          else monthExpense += amt;
        }

        const initialBal = Number(account.initial_balance);
        const currentBalance = initialBal + totalIncome - totalExpense;

        return {
          ...account,
          initial_balance: initialBal,
          current_balance: currentBalance,
          month_income: monthIncome,
          month_expense: monthExpense,
          month_balance: monthIncome - monthExpense,
          transactions_count: allTransactions.length,
        };
      })
    );

    return enriched;
  }

  async getById(userId: string, id: string) {
    const account = await prisma.account.findFirst({
      where: { id, user_id: userId },
    });

    if (!account) {
      throw { statusCode: 404, message: 'Conta bancária não encontrada.' };
    }

    const allTransactions = await prisma.transaction.findMany({
      where: { user_id: userId, account_id: id },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 20,
    });

    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of allTransactions) {
      const amt = Number(t.amount);
      if (t.type === TransactionType.INCOME) totalIncome += amt;
      else totalExpense += amt;
    }

    const initialBal = Number(account.initial_balance);
    const currentBalance = initialBal + totalIncome - totalExpense;

    return {
      ...account,
      initial_balance: initialBal,
      current_balance: currentBalance,
      recent_transactions: allTransactions.map((t) => ({
        ...t,
        amount: Number(t.amount),
      })),
    };
  }

  async create(userId: string, data: CreateAccountInput) {
    const count = await prisma.account.count({ where: { user_id: userId } });
    const isDefault = data.is_default || count === 0;

    if (isDefault) {
      await prisma.account.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    const account = await prisma.account.create({
      data: {
        user_id: userId,
        name: data.name.trim(),
        type: data.type,
        color: data.color || '#10b981',
        icon: data.icon || 'Landmark',
        initial_balance: data.initial_balance || 0,
        is_default: isDefault,
      },
    });

    return {
      ...account,
      initial_balance: Number(account.initial_balance),
      current_balance: Number(account.initial_balance),
      month_income: 0,
      month_expense: 0,
      month_balance: 0,
      transactions_count: 0,
    };
  }

  async update(userId: string, id: string, data: UpdateAccountInput) {
    const existing = await prisma.account.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Conta bancária não encontrada.' };
    }

    if (data.is_default) {
      await prisma.account.updateMany({
        where: { user_id: userId, id: { not: id } },
        data: { is_default: false },
      });
    }

    const updated = await prisma.account.update({
      where: { id },
      data: {
        name: data.name !== undefined ? data.name.trim() : existing.name,
        type: data.type !== undefined ? data.type : existing.type,
        color: data.color !== undefined ? data.color : existing.color,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        initial_balance: data.initial_balance !== undefined ? data.initial_balance : existing.initial_balance,
        is_default: data.is_default !== undefined ? data.is_default : existing.is_default,
      },
    });

    return {
      ...updated,
      initial_balance: Number(updated.initial_balance),
    };
  }

  async delete(userId: string, id: string) {
    const existing = await prisma.account.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Conta bancária não encontrada.' };
    }

    const totalAccounts = await prisma.account.count({ where: { user_id: userId } });
    if (totalAccounts <= 1) {
      throw { statusCode: 400, message: 'Você precisa manter ao menos uma conta cadastrada.' };
    }

    await prisma.account.delete({ where: { id } });

    // Se a conta excluída era padrão, define outra como padrão
    if (existing.is_default) {
      const another = await prisma.account.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'asc' },
      });
      if (another) {
        await prisma.account.update({
          where: { id: another.id },
          data: { is_default: true },
        });
      }
    }

    return { message: 'Conta bancária excluída com sucesso.' };
  }
}
