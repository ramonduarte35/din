"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const client_1 = require("@prisma/client");
class TransactionsService {
    async list(userId, query) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(100, Math.max(1, query.limit || 20));
        const skip = (page - 1) * limit;
        const where = {
            user_id: userId,
        };
        if (query.type) {
            where.type = query.type;
        }
        if (query.category_id) {
            where.category_id = query.category_id;
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
            prisma_js_1.prisma.transaction.count({ where }),
            prisma_js_1.prisma.transaction.findMany({
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
    async createManual(userId, data) {
        const transaction = await prisma_js_1.prisma.transaction.create({
            data: {
                user_id: userId,
                description: data.description,
                amount: data.amount,
                type: data.type,
                category_id: data.category_id || null,
                date: data.date ? new Date(data.date) : new Date(),
                origin: client_1.TransactionOrigin.MANUAL,
            },
            include: {
                category: true,
            },
        });
        return {
            ...transaction,
            amount: Number(transaction.amount),
        };
    }
    async update(userId, transactionId, data) {
        const existing = await prisma_js_1.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!existing || existing.user_id !== userId) {
            throw { statusCode: 404, message: 'Transação não encontrada.' };
        }
        const updated = await prisma_js_1.prisma.transaction.update({
            where: { id: transactionId },
            data: {
                description: data.description,
                amount: data.amount,
                type: data.type,
                category_id: data.category_id !== undefined ? data.category_id : existing.category_id,
                date: data.date ? new Date(data.date) : existing.date,
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
    async delete(userId, transactionId) {
        const existing = await prisma_js_1.prisma.transaction.findUnique({
            where: { id: transactionId },
        });
        if (!existing || existing.user_id !== userId) {
            throw { statusCode: 404, message: 'Transação não encontrada.' };
        }
        await prisma_js_1.prisma.transaction.delete({
            where: { id: transactionId },
        });
        return { message: 'Transação excluída com sucesso.' };
    }
    async getSummary(userId) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        // Mês anterior para cálculo de variação
        const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        // Agregações do mês atual
        const currentMonthTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: {
                user_id: userId,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: {
                category: true,
            },
        });
        // Agregações do mês anterior
        const prevMonthTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: {
                user_id: userId,
                date: { gte: startOfPrevMonth, lte: endOfPrevMonth },
            },
        });
        // Cálculos Mês Atual
        let currentIncome = 0;
        let currentExpense = 0;
        const categoryTotals = {};
        for (const t of currentMonthTransactions) {
            const amount = Number(t.amount);
            if (t.type === client_1.TransactionType.INCOME) {
                currentIncome += amount;
            }
            else {
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
            if (t.type === client_1.TransactionType.INCOME)
                prevIncome += amount;
            else
                prevExpense += amount;
        }
        // Saldo Total Geral Histórico do Usuário
        const allUserTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: { user_id: userId },
            select: { type: true, amount: true },
        });
        let totalHistoricalBalance = 0;
        for (const t of allUserTransactions) {
            const amount = Number(t.amount);
            if (t.type === client_1.TransactionType.INCOME)
                totalHistoricalBalance += amount;
            else
                totalHistoricalBalance -= amount;
        }
        // Histórico dos últimos 6 meses
        const monthlyHistory = [];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        for (let i = 5; i >= 0; i--) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const mStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
            const mEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0, 23, 59, 59, 999);
            const mTransactions = await prisma_js_1.prisma.transaction.findMany({
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
                if (t.type === client_1.TransactionType.INCOME)
                    mIncome += amt;
                else
                    mExpense += amt;
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
        const recentTransactions = await prisma_js_1.prisma.transaction.findMany({
            where: { user_id: userId },
            include: {
                category: {
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
exports.TransactionsService = TransactionsService;
