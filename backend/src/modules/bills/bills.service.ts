import { PrismaClient, BillStatus, TransactionType, TransactionOrigin, Prisma } from '@prisma/client';
import { CreateBillInput, UpdateBillInput, PayBillInput, ListBillsQueryInput } from './bills.schemas';

const prisma = new PrismaClient();

export class BillsService {
  /**
   * Criar uma nova conta a pagar
   */
  async createBill(userId: string, data: CreateBillInput) {
    // Se category_id fornecido, verificar se pertence ao usuário ou é global
    if (data.category_id) {
      const cat = await prisma.category.findFirst({
        where: {
          id: data.category_id,
          OR: [{ user_id: userId }, { user_id: null }],
        },
      });
      if (!cat) {
        throw new Error('Categoria não encontrada ou inválida');
      }
    }

    // Se account_id fornecido previamente, verificar se pertence ao usuário
    if (data.account_id) {
      const acc = await prisma.account.findFirst({
        where: { id: data.account_id, user_id: userId },
      });
      if (!acc) {
        throw new Error('Conta bancária não encontrada');
      }
    }

    const dueDate = new Date(data.due_date);

    return await prisma.bill.create({
      data: {
        user_id: userId,
        description: data.description.trim(),
        amount: new Prisma.Decimal(data.amount),
        due_date: dueDate,
        category_id: data.category_id || null,
        account_id: data.account_id || null,
        barcode: data.barcode?.trim() || null,
        notes: data.notes?.trim() || null,
        is_recurring: data.is_recurring ?? false,
        status: BillStatus.PENDING,
      },
      include: {
        category: true,
        account: true,
      },
    });
  }

  /**
   * Listar contas a pagar com filtros e paginação
   */
  async listBills(userId: string, query: ListBillsQueryInput) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.BillWhereInput = {
      user_id: userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.category_id) {
      where.category_id = query.category_id;
    }

    if (query.account_id) {
      where.account_id = query.account_id;
    }

    if (query.search) {
      where.description = { contains: query.search, mode: 'insensitive' };
    }

    // Filtro por mês/ano ou período de vencimento
    if (query.month && query.year) {
      const startOfMonth = new Date(query.year, query.month - 1, 1);
      const endOfMonth = new Date(query.year, query.month, 0, 23, 59, 59, 999);
      where.due_date = { gte: startOfMonth, lte: endOfMonth };
    } else if (query.start_due_date || query.end_due_date) {
      where.due_date = {};
      if (query.start_due_date) {
        where.due_date.gte = new Date(query.start_due_date);
      }
      if (query.end_due_date) {
        where.due_date.lte = new Date(query.end_due_date);
      }
    }

    const [total, bills] = await Promise.all([
      prisma.bill.count({ where }),
      prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ status: 'asc' }, { due_date: 'asc' }],
        include: {
          category: true,
          account: true,
          transaction: true,
        },
      }),
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Mapear contas com status dinâmico para OVERDUE se estiverem vencidas e pendentes
    const formattedBills = bills.map((bill) => {
      let currentStatus = bill.status;
      const billDueDate = new Date(bill.due_date);
      billDueDate.setHours(0, 0, 0, 0);

      if (bill.status === BillStatus.PENDING && billDueDate < today) {
        currentStatus = BillStatus.OVERDUE;
      }

      return {
        ...bill,
        amount: Number(bill.amount),
        computed_status: currentStatus,
      };
    });

    return {
      bills: formattedBills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obter resumo / KPIs de contas a pagar
   */
  async getBillSummary(userId: string, month?: number, year?: number) {
    const now = new Date();
    const targetMonth = month || now.getMonth() + 1;
    const targetYear = year || now.getFullYear();

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);
    in7Days.setHours(23, 59, 59, 999);

    const allBills = await prisma.bill.findMany({
      where: {
        user_id: userId,
        OR: [
          { due_date: { gte: startOfMonth, lte: endOfMonth } },
          { status: BillStatus.PENDING, due_date: { lt: today } }, // Inclui vencidas mesmo de meses anteriores
        ],
      },
      include: {
        category: true,
        account: true,
      },
      orderBy: { due_date: 'asc' },
    });

    let totalPendingAmount = 0;
    let totalPendingCount = 0;
    let totalOverdueAmount = 0;
    let totalOverdueCount = 0;
    let totalPaidAmount = 0;
    let totalPaidCount = 0;

    const upcomingBills: any[] = [];

    for (const bill of allBills) {
      const amount = Number(bill.amount);
      const billDueDate = new Date(bill.due_date);
      billDueDate.setHours(0, 0, 0, 0);

      if (bill.status === BillStatus.PAID) {
        // Apenas soma pagas do mês selecionado
        if (bill.due_date >= startOfMonth && bill.due_date <= endOfMonth) {
          totalPaidAmount += amount;
          totalPaidCount++;
        }
      } else if (bill.status === BillStatus.PENDING) {
        if (billDueDate < today) {
          totalOverdueAmount += amount;
          totalOverdueCount++;
        } else {
          totalPendingAmount += amount;
          totalPendingCount++;

          if (billDueDate >= today && billDueDate <= in7Days) {
            upcomingBills.push({
              ...bill,
              amount,
              computed_status: BillStatus.PENDING,
            });
          }
        }
      }
    }

    return {
      month: targetMonth,
      year: targetYear,
      total_pending: {
        amount: totalPendingAmount,
        count: totalPendingCount,
      },
      total_overdue: {
        amount: totalOverdueAmount,
        count: totalOverdueCount,
      },
      total_paid: {
        amount: totalPaidAmount,
        count: totalPaidCount,
      },
      upcoming_bills: upcomingBills,
    };
  }

  /**
   * Obter conta por ID
   */
  async getBillById(userId: string, id: string) {
    const bill = await prisma.bill.findFirst({
      where: { id, user_id: userId },
      include: {
        category: true,
        account: true,
        transaction: true,
      },
    });

    if (!bill) {
      throw new Error('Conta a pagar não encontrada');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const billDueDate = new Date(bill.due_date);
    billDueDate.setHours(0, 0, 0, 0);

    let currentStatus = bill.status;
    if (bill.status === BillStatus.PENDING && billDueDate < today) {
      currentStatus = BillStatus.OVERDUE;
    }

    return {
      ...bill,
      amount: Number(bill.amount),
      computed_status: currentStatus,
    };
  }

  /**
   * Atualizar conta a pagar
   */
  async updateBill(userId: string, id: string, data: UpdateBillInput) {
    const existing = await prisma.bill.findFirst({
      where: { id, user_id: userId },
    });

    if (!existing) {
      throw new Error('Conta a pagar não encontrada');
    }

    if (data.category_id) {
      const cat = await prisma.category.findFirst({
        where: {
          id: data.category_id,
          OR: [{ user_id: userId }, { user_id: null }],
        },
      });
      if (!cat) throw new Error('Categoria inválida');
    }

    if (data.account_id) {
      const acc = await prisma.account.findFirst({
        where: { id: data.account_id, user_id: userId },
      });
      if (!acc) throw new Error('Conta bancária inválida');
    }

    const updateData: Prisma.BillUpdateInput = {};

    if (data.description !== undefined) updateData.description = data.description.trim();
    if (data.amount !== undefined) updateData.amount = new Prisma.Decimal(data.amount);
    if (data.due_date !== undefined) updateData.due_date = new Date(data.due_date);
    if (data.category_id !== undefined) updateData.category = data.category_id ? { connect: { id: data.category_id } } : { disconnect: true };
    if (data.account_id !== undefined) updateData.account = data.account_id ? { connect: { id: data.account_id } } : { disconnect: true };
    if (data.barcode !== undefined) updateData.barcode = data.barcode?.trim() || null;
    if (data.notes !== undefined) updateData.notes = data.notes?.trim() || null;
    if (data.is_recurring !== undefined) updateData.is_recurring = data.is_recurring;
    if (data.status !== undefined) updateData.status = data.status;

    return await prisma.bill.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        account: true,
        transaction: true,
      },
    });
  }

  /**
   * Pagar conta: debita da conta bancária escolhida e gera a transação de despesa
   */
  async payBill(userId: string, id: string, data: PayBillInput) {
    const bill = await prisma.bill.findFirst({
      where: { id, user_id: userId },
      include: { category: true },
    });

    if (!bill) {
      throw new Error('Conta a pagar não encontrada');
    }

    if (bill.status === BillStatus.PAID) {
      throw new Error('Esta conta já foi marcada como paga');
    }

    // Validar conta bancária de débito
    const account = await prisma.account.findFirst({
      where: { id: data.account_id, user_id: userId },
    });

    if (!account) {
      throw new Error('Conta bancária para débito não encontrada');
    }

    const paidDate = data.paid_date ? new Date(data.paid_date) : new Date();
    const paidAmount = data.amount ? new Prisma.Decimal(data.amount) : bill.amount;

    // Executar transação de forma atômica no banco
    return await prisma.$transaction(async (tx) => {
      // 1. Criar transação de despesa na conta bancária selecionada
      const transaction = await tx.transaction.create({
        data: {
          user_id: userId,
          account_id: account.id,
          category_id: bill.category_id,
          description: `Pagamento: ${bill.description}`,
          amount: paidAmount,
          type: TransactionType.EXPENSE,
          date: paidDate,
          origin: TransactionOrigin.MANUAL,
        },
      });

      // 2. Atualizar a conta a pagar para PAID com o vínculo da transação e conta bancária
      const updatedBill = await tx.bill.update({
        where: { id },
        data: {
          status: BillStatus.PAID,
          paid_date: paidDate,
          account_id: account.id,
          amount: paidAmount, // Atualiza se foi pago valor diferente
          transaction_id: transaction.id,
        },
        include: {
          category: true,
          account: true,
          transaction: true,
        },
      });

      return {
        bill: {
          ...updatedBill,
          amount: Number(updatedBill.amount),
        },
        transaction: {
          ...transaction,
          amount: Number(transaction.amount),
        },
        debited_account: {
          id: account.id,
          name: account.name,
        },
      };
    });
  }

  /**
   * Desfazer pagamento: restaura para PENDING e exclui a transação de despesa criada
   */
  async unpayBill(userId: string, id: string) {
    const bill = await prisma.bill.findFirst({
      where: { id, user_id: userId },
    });

    if (!bill) {
      throw new Error('Conta a pagar não encontrada');
    }

    if (bill.status !== BillStatus.PAID) {
      throw new Error('Esta conta não está marcada como paga');
    }

    return await prisma.$transaction(async (tx) => {
      // Se houver transação vinculada, remover
      if (bill.transaction_id) {
        await tx.transaction.delete({
          where: { id: bill.transaction_id },
        }).catch(() => null);
      }

      const updatedBill = await tx.bill.update({
        where: { id },
        data: {
          status: BillStatus.PENDING,
          paid_date: null,
          transaction_id: null,
        },
        include: {
          category: true,
          account: true,
        },
      });

      return {
        ...updatedBill,
        amount: Number(updatedBill.amount),
      };
    });
  }

  /**
   * Excluir conta a pagar
   */
  async deleteBill(userId: string, id: string) {
    const bill = await prisma.bill.findFirst({
      where: { id, user_id: userId },
    });

    if (!bill) {
      throw new Error('Conta a pagar não encontrada');
    }

    return await prisma.$transaction(async (tx) => {
      if (bill.transaction_id) {
        await tx.transaction.delete({
          where: { id: bill.transaction_id },
        }).catch(() => null);
      }

      await tx.bill.delete({ where: { id } });
      return { success: true, message: 'Conta a pagar excluída com sucesso' };
    });
  }
}
