"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
class CategoriesService {
    async listCategories(userId) {
        return prisma_js_1.prisma.category.findMany({
            where: {
                OR: [{ user_id: null }, { user_id: userId }],
            },
            orderBy: [{ name: 'asc' }],
        });
    }
    async createCategory(userId, data) {
        const existing = await prisma_js_1.prisma.category.findFirst({
            where: {
                name: { equals: data.name, mode: 'insensitive' },
                OR: [{ user_id: null }, { user_id: userId }],
            },
        });
        if (existing) {
            throw { statusCode: 409, message: 'Já existe uma categoria com este nome.' };
        }
        return prisma_js_1.prisma.category.create({
            data: {
                name: data.name,
                type: data.type,
                icon: data.icon,
                color: data.color,
                user_id: userId,
            },
        });
    }
    async updateCategory(userId, categoryId, data) {
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw { statusCode: 404, message: 'Categoria não encontrada.' };
        }
        if (category.user_id !== userId) {
            throw { statusCode: 403, message: 'Você não pode editar uma categoria padrão do sistema.' };
        }
        if (data.name) {
            const existing = await prisma_js_1.prisma.category.findFirst({
                where: {
                    id: { not: categoryId },
                    name: { equals: data.name, mode: 'insensitive' },
                    OR: [{ user_id: null }, { user_id: userId }],
                },
            });
            if (existing) {
                throw { statusCode: 409, message: 'Já existe outra categoria com este nome.' };
            }
        }
        return prisma_js_1.prisma.category.update({
            where: { id: categoryId },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.type && { type: data.type }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.color !== undefined && { color: data.color }),
            },
        });
    }
    async deleteCategory(userId, categoryId) {
        const category = await prisma_js_1.prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category) {
            throw { statusCode: 404, message: 'Categoria não encontrada.' };
        }
        if (category.user_id !== userId) {
            throw { statusCode: 403, message: 'Você não pode excluir uma categoria do sistema.' };
        }
        await prisma_js_1.prisma.category.delete({
            where: { id: categoryId },
        });
        return { message: 'Categoria excluída com sucesso.' };
    }
}
exports.CategoriesService = CategoriesService;
