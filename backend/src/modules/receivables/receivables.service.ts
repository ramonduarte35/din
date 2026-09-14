import { ReceivableStatus, TransactionType, TransactionOrigin, Prisma } from '@prisma/client';
import {
  CreateReceivableInput,
  UpdateReceivableInput,
  ReceiveReceivableInput,
  ListReceivablesQueryInput,
} from './receivables.schemas.js';
import { prisma } from '../../lib/prisma.js';
import { getDiffDays, parseDateSafe } from '../../utils/date.js';
import { randomUUID } from 'crypto';

export class ReceivablesService {
  /**
   * Criar nova conta a receber (com suporte a parcelamento automático)
   */
  async createReceivable(userId: string, data: CreateReceivableInput) {
    if (data.contact_id) {
      const contact = await prisma.contact.findFirst({
        where: { id: data.contact_id, user_id: userId },
      });
      if (!contact) throw new Error('Contato não encontrado ou inválido');
    }

    if (data.category_id) {
      const cat = await prisma.category.findFirst({
        where: { id: data.category_id, OR: [{ user_id: userId }, { user_id: null }] },
      });
      if (!cat) throw new Error('Categoria não encontrada ou inválida');
    }

    if (data.account_id) {
      const acc = await prisma.account.findFirst({ where: { id: data.account_id, user_id: userId } });
      if (!acc) throw new Error('Conta bancária não encontrada');
    }

    const totalInstallments = data.total_installments && data.total_installments > 1 ? data.total_installments : 1;
    const cleanDescription = data.description.trim();

    // Extrair data de forma determinística em UTC
    const match = typeof data.due_date === 'string' ? data.due_date.match(/^(\d{4})-(\d{2})-(\d{2})/) : null;
    let baseYear: number;
    let baseMonth: number;
    let baseDay: number;

    if (match) {
      baseYear = Number(match[1]);
      baseMonth = Number(match[2]) - 1;
      baseDay = Number(match[3]);
    } else {
      const parsed = parseDateSafe(data.due_date) || new Date(data.due_date);
      baseYear = parsed.getUTCFullYear();
      baseMonth = parsed.getUTCMonth();
      baseDay = parsed.getUTCDate();
    }

    // Parcelamento
    if (totalInstallments > 1) {
      const groupId = randomUUID();
      const receivablesToCreate = [];

      for (let i = 1; i <= totalInstallments; i++) {
        const daysInTargetMonth = new Date(Date.UTC(baseYear, baseMonth + i, 0)).getUTCDate();
        const targetDay = Math.min(baseDay, daysInTargetMonth);
        const installmentDueDate = new Date(Date.UTC(baseYear, baseMonth + (i - 1), targetDay, 12, 0, 0, 0));

        const installmentDesc = cleanDescription.match(/\(\d+\/\d+\)$/)
          ? cleanDescription.replace(/\(\d+\/\d+\)$/, `(${i}/${totalInstallments})`)
          : `${cleanDescription} (${i}/${totalInstallments})`;

        receivablesToCreate.push({
          user_id: userId,
          description: installmentDesc,
          amount: new Prisma.Decimal(data.amount),
          due_date: installmentDueDate,
          contact_id: data.contact_id || null,
          category_id: data.category_id || null,
          account_id: data.account_id || null,
          notes: data.notes?.trim() || null,
          is_recurring: false,
          installment_number: i,
          total_installments: totalInstallments,
          group_id: groupId,
          status: ReceivableStatus.PENDING,
        });
      }

      const created = await prisma.$transaction(
        receivablesToCreate.map((r) =>
          prisma.receivable.create({
            data: r,
            include: { contact: true, category: true, account: true },
          })
        )
      );

      return created[0];
    }

    const singleDueDate = new Date(Date.UTC(baseYear, baseMonth, baseDay, 12, 0, 0, 0));

    return await prisma.receivable.create({
      data: {
        user_id: userId,
        description: cleanDescription,
        amount: new Prisma.Decimal(data.amount),
        due_date: singleDueDate,
        contact_id: data.contact_id || null,
        category_id: data.category_id || null,
        account_id: data.account_id || null,
        notes: data.notes?.trim() || null,
        is_recurring: data.is_recurring ?? false,
        installment_number: 1,
        total_installments: 1,
        group_id: null,
        status: ReceivableStatus.PENDING,
      },
      include: { contact: true, category: true, account: true },
    });
  }

  /**
   * Listar contas a receber com filtros e paginação
   */
  async listReceivables(userId: string, query: ListReceivablesQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ReceivableWhereInput = { user_id: userId };

    if (query.status) where.status = query.status;
    if (query.contact_id) where.contact_id = query.contact_id;
    if (query.category_id) where.category_id = query.category_id;
    if (query.account_id) where.account_id = query.account_id;
    if (query.search) where.description = { contains: query.search, mode: 'insensitive' };

    if (query.month && query.year) {
      const startOfMonth = new Date(Date.UTC(query.year, query.month - 1, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(query.year, query.month, 0, 23, 59, 59, 999));
      where.due_date = { gte: startOfMonth, lte: endOfMonth };
    } else if (query.start_due_date || query.end_due_date) {
      where.due_date = {};
      if (query.start_due_date) {
        where.due_date.gte = parseDateSafe(query.start_due_date) || new Date(query.start_due_date);
      }
      if (query.end_due_date) {
        where.due_date.lte = parseDateSafe(query.end_due_date) || new Date(query.end_due_date);
      }
    }

    const [total, receivables] = await Promise.all([
      prisma.receivable.count({ where }),
      prisma.receivable.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { due_date: 'asc' }],
        include: { contact: true, category: true, account: true, transaction: true },
      }),
    ]);

    const formatted = receivables.map((r) => {
      let currentStatus = r.status;
      const diffDays = getDiffDays(r.due_date);
      if (r.status === ReceivableStatus.PENDING && diffDays < 0) {
        currentStatus = ReceivableStatus.OVERDUE;
      }
      return { ...r, amount: Number(r.amount), computed_status: currentStatus };
    });

    return {
      receivables: formatted,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * KPIs de contas a receber
   */
  async getReceivableSummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getUTCMonth() + 1;
    const targetYear = year || now.getUTCFullYear();

    const startOfMonth = new Date(Date.UTC(targetYear, targetMonth - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(targetYear, targetMonth, 0, 23, 59, 59, 999));

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const in7Days = new Date(today);
    in7Days.setUTCDate(in7Days.getUTCDate() + 7);
    in7Days.setUTCHours(23, 59, 59, 999);

    const allReceivables = await prisma.receivable.findMany({
      where: { user_id: userId, due_date: { gte: startOfMonth, lte: endOfMonth } },
      include: { contact: true, category: true, account: true },
      orderBy: { due_date: 'asc' },
    });

    let totalPendingAmount = 0;
    let totalPendingCount = 0;
    let totalOverdueAmount = 0;
    let totalOverdueCount = 0;
    let totalReceivedAmount = 0;
    let totalReceivedCount = 0;
    const upcomingReceivables: any[] = [];

    for (const r of allReceivables) {
      const amount = Number(r.amount);
      const diffDays = getDiffDays(r.due_date);

      if (r.status === ReceivableStatus.RECEIVED) {
        totalReceivedAmount += amount;
        totalReceivedCount++;
      } else if (r.status === ReceivableStatus.PENDING) {
        if (diffDays < 0) {
          totalOverdueAmount += amount;
          totalOverdueCount++;
        } else {
          totalPendingAmount += amount;
          totalPendingCount++;
          if (diffDays >= 0 && diffDays <= 7) {
            upcomingReceivables.push({
              ...r,
              amount,
              computed_status: ReceivableStatus.PENDING,
            });
          }
        }
      }
    }

    return {
      month: targetMonth,
      year: targetYear,
      total_pending: { amount: totalPendingAmount, count: totalPendingCount },
      total_overdue: { amount: totalOverdueAmount, count: totalOverdueCount },
      total_received: { amount: totalReceivedAmount, count: totalReceivedCount },
      upcoming_receivables: upcomingReceivables,
    };
  }

  /**
   * Obter conta a receber por ID
   */
  async getReceivableById(userId: string, id: string) {
    const r = await prisma.receivable.findFirst({
      where: { id, user_id: userId },
      include: { contact: true, category: true, account: true, transaction: true },
    });

    if (!r) throw new Error('Conta a receber não encontrada');

    let currentStatus = r.status;
    const diffDays = getDiffDays(r.due_date);
    if (r.status === ReceivableStatus.PENDING && diffDays < 0) {
      currentStatus = ReceivableStatus.OVERDUE;
    }

    return { ...r, amount: Number(r.amount), computed_status: currentStatus };
  }

  /**
   * Atualizar conta a receber
   */
  async updateReceivable(userId: string, id: string, data: UpdateReceivableInput) {
    const existing = await prisma.receivable.findFirst({ where: { id, user_id: userId } });
    if (!existing) throw new Error('Conta a receber não encontrada');

    if (data.contact_id) {
      const contact = await prisma.contact.findFirst({ where: { id: data.contact_id, user_id: userId } });
      if (!contact) throw new Error('Contato inválido');
    }

    if (data.category_id) {
      const cat = await prisma.category.findFirst({
        where: { id: data.category_id, OR: [{ user_id: userId }, { user_id: null }] },
      });
      if (!cat) throw new Error('Categoria inválida');
    }

    if (data.account_id) {
      const acc = await prisma.account.findFirst({ where: { id: data.account_id, user_id: userId } });
      if (!acc) throw new Error('Conta bancária inválida');
    }

    const updateData: Prisma.ReceivableUpdateInput = {};
    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
    if (data.due_date !== undefined) updateData.due_date = parseDateSafe(data.due_date) || new Date(data.due_date);
    if (data.contact_id !== undefined)
      updateData.contact = data.contact_id ? { connect: { id: data.contact_id } } : { disconnect: true };
    if (data.category_id !== undefined)
      updateData.category = data.category_id ? { connect: { id: data.category_id } } : { disconnect: true };
    if (data.account_id !== undefined)
      updateData.account = data.account_id ? { connect: { id: data.account_id } } : { disconnect: true };
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;
    if (data.is_recurring !== undefined) updateData.is_recurring = data.is_recurring;
    if (data.installment_number !== undefined) updateData.installment_number = data.installment_number;
    if (data.total_installments !== undefined) updateData.total_installments = data.total_installments;
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.receivable.update({
      where: { id },
      data: updateData,
      include: { contact: true, category: true, account: true, transaction: true },
    });
  }

  /**
   * Marcar como recebido: credita na conta bancária e gera transação INCOME
   */
  async receiveReceivable(userId: string, id: string, data: ReceiveReceivableInput) {
    const receivable = await prisma.receivable.findFirst({
      where: { id, user_id: userId },
      include: { category: true },
    });

    if (!receivable) throw new Error('Conta a receber não encontrada');
    if (receivable.status === ReceivableStatus.RECEIVED) throw new Error('Esta conta já foi marcada como recebida');

    const account = await prisma.account.findFirst({ where: { id: data.account_id, user_id: userId } });
    if (!account) throw new Error('Conta bancária para crédito não encontrada');

    const receivedDate = data.received_date ? new Date(data.received_date) : new Date();
    const receivedAmount = data.amount ? new Prisma.Decimal(data.amount) : receivable.amount;

    return await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          account_id: account.id,
          category_id: receivable.category_id,
          description: `Recebimento: ${receivable.description}`,
          amount: receivedAmount,
          type: TransactionType.INCOME,
          date: receivedDate,
          origin: TransactionOrigin.MANUAL,
        },
      });

      const updatedReceivable = await tx.receivable.update({
        where: { id },
        data: {
          status: ReceivableStatus.RECEIVED,
          received_date: receivedDate,
          account_id: account.id,
          amount: receivedAmount,
          transaction_id: transaction.id,
        },
        include: { contact: true, category: true, account: true, transaction: true },
      });

      return {
        receivable: { ...updatedReceivable, amount: Number(updatedReceivable.amount) },
        transaction: { ...transaction, amount: Number(transaction.amount) },
        credited_account: { id: account.id, name: account.name },
      };
    });
  }

  /**
   * Desfazer recebimento: restaura para PENDING e exclui a transação de crédito
   */
  async unreceiveReceivable(userId: string, id: string) {
    const receivable = await prisma.receivable.findFirst({ where: { id, user_id: userId } });
    if (!receivable) throw new Error('Conta a receber não encontrada');
    if (receivable.status !== ReceivableStatus.RECEIVED) throw new Error('Esta conta não está marcada como recebida');

    return await prisma.$transaction(async (tx) => {
      if (receivable.transaction_id) {
        await tx.transaction.delete({ where: { id: receivable.transaction_id } }).catch(() => null);
      }

      const updated = await tx.receivable.update({
        where: { id },
        data: { status: ReceivableStatus.PENDING, received_date: null, transaction_id: null },
        include: { contact: true, category: true, account: true },
      });

      return { ...updated, amount: Number(updated.amount) };
    });
  }

  /**
   * Excluir conta a receber
   */
  async deleteReceivable(userId: string, id: string, scope: 'SINGLE' | 'ALL' = 'SINGLE') {
    const receivable = await prisma.receivable.findFirst({ where: { id, user_id: userId } });

    if (!receivable) {
      return { success: true, deleted: 0, message: 'Conta a receber já foi excluída' };
    }

    return await prisma.$transaction(async (tx) => {
      if (scope === 'ALL') {
        let idsToDelete: string[] = [id];
        let transactionIds: string[] = receivable.transaction_id ? [receivable.transaction_id] : [];

        if (receivable.group_id) {
          const groupItems = await tx.receivable.findMany({
            where: { group_id: receivable.group_id, user_id: userId },
            select: { id: true, transaction_id: true },
          });
          idsToDelete = groupItems.map((r) => r.id);
          transactionIds = groupItems.map((r) => r.transaction_id).filter(Boolean) as string[];
        }

        if (transactionIds.length > 0) {
          await tx.transaction.deleteMany({ where: { id: { in: transactionIds } } });
        }

        await tx.receivable.deleteMany({ where: { id: { in: idsToDelete } } });
        return { success: true, deleted: idsToDelete.length, message: `${idsToDelete.length} parcela(s) excluída(s)` };
      }

      if (receivable.transaction_id) {
        await tx.transaction.delete({ where: { id: receivable.transaction_id } }).catch(() => null);
      }

      await tx.receivable.delete({ where: { id } });
      return { success: true, deleted: 1, message: 'Conta a receber excluída com sucesso' };
    });
  }
}
