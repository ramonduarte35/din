"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
class GoalsService {
    async listGoals(userId) {
        const goals = await prisma_js_1.prisma.goal.findMany({
            where: { user_id: userId },
            orderBy: [{ is_completed: 'asc' }, { created_at: 'desc' }],
        });
        return goals.map((g) => ({
            ...g,
            target_amount: Number(g.target_amount),
            current_amount: Number(g.current_amount),
            progress: Number(g.target_amount) > 0
                ? Math.min(100, Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100))
                : 0,
        }));
    }
    async createGoal(userId, data) {
        const goal = await prisma_js_1.prisma.goal.create({
            data: {
                user_id: userId,
                title: data.title,
                target_amount: data.target_amount,
                current_amount: data.current_amount || 0,
                deadline: data.deadline ? new Date(data.deadline) : null,
                icon: data.icon || 'Target',
                color: data.color || '#10b981',
            },
        });
        return {
            ...goal,
            target_amount: Number(goal.target_amount),
            current_amount: Number(goal.current_amount),
        };
    }
    async updateGoal(userId, goalId, data) {
        const goal = await prisma_js_1.prisma.goal.findUnique({
            where: { id: goalId },
        });
        if (!goal || goal.user_id !== userId) {
            throw { statusCode: 404, message: 'Meta financeira não encontrada.' };
        }
        const updated = await prisma_js_1.prisma.goal.update({
            where: { id: goalId },
            data: {
                ...(data.title && { title: data.title }),
                ...(data.target_amount !== undefined && { target_amount: data.target_amount }),
                ...(data.current_amount !== undefined && { current_amount: data.current_amount }),
                ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.is_completed !== undefined && { is_completed: data.is_completed }),
            },
        });
        return {
            ...updated,
            target_amount: Number(updated.target_amount),
            current_amount: Number(updated.current_amount),
        };
    }
    async depositGoal(userId, goalId, data) {
        const goal = await prisma_js_1.prisma.goal.findUnique({
            where: { id: goalId },
        });
        if (!goal || goal.user_id !== userId) {
            throw { statusCode: 404, message: 'Meta financeira não encontrada.' };
        }
        const newAmount = Number(goal.current_amount) + data.amount;
        const isCompleted = newAmount >= Number(goal.target_amount);
        const updated = await prisma_js_1.prisma.goal.update({
            where: { id: goalId },
            data: {
                current_amount: newAmount,
                is_completed: isCompleted,
            },
        });
        return {
            ...updated,
            target_amount: Number(updated.target_amount),
            current_amount: Number(updated.current_amount),
        };
    }
    async deleteGoal(userId, goalId) {
        const goal = await prisma_js_1.prisma.goal.findUnique({
            where: { id: goalId },
        });
        if (!goal || goal.user_id !== userId) {
            throw { statusCode: 404, message: 'Meta financeira não encontrada.' };
        }
        await prisma_js_1.prisma.goal.delete({
            where: { id: goalId },
        });
        return { message: 'Meta excluída com sucesso.' };
    }
}
exports.GoalsService = GoalsService;
