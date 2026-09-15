"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactsService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
class ContactsService {
    /**
     * Criar novo contato
     */
    async createContact(userId, data) {
        return await prisma_js_1.prisma.contact.create({
            data: {
                user_id: userId,
                name: data.name.trim(),
                type: data.type,
                document: data.document?.trim() || null,
                email: data.email?.trim() || null,
                phone: data.phone?.trim() || null,
                notes: data.notes?.trim() || null,
            },
            include: {
                _count: { select: { receivables: true, bills: true } },
            },
        });
    }
    /**
     * Listar contatos com filtros e paginação
     */
    async listContacts(userId, query) {
        const page = query.page || 1;
        const limit = query.limit || 100;
        const skip = (page - 1) * limit;
        const where = { user_id: userId };
        if (query.type) {
            where.type = query.type;
        }
        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { document: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [total, contacts] = await Promise.all([
            prisma_js_1.prisma.contact.count({ where }),
            prisma_js_1.prisma.contact.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
                include: {
                    _count: { select: { receivables: true, bills: true } },
                },
            }),
        ]);
        return {
            contacts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Obter contato por ID
     */
    async getContactById(userId, id) {
        const contact = await prisma_js_1.prisma.contact.findFirst({
            where: { id, user_id: userId },
            include: {
                _count: { select: { receivables: true, bills: true } },
                receivables: {
                    orderBy: { due_date: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        description: true,
                        amount: true,
                        due_date: true,
                        status: true,
                    },
                },
                bills: {
                    orderBy: { due_date: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        description: true,
                        amount: true,
                        due_date: true,
                        status: true,
                    },
                },
            },
        });
        if (!contact) {
            throw new Error('Contato não encontrado');
        }
        return contact;
    }
    /**
     * Atualizar contato
     */
    async updateContact(userId, id, data) {
        const existing = await prisma_js_1.prisma.contact.findFirst({ where: { id, user_id: userId } });
        if (!existing) {
            throw new Error('Contato não encontrado');
        }
        const updateData = {};
        if (data.name !== undefined)
            updateData.name = data.name.trim();
        if (data.type !== undefined)
            updateData.type = data.type;
        if (data.document !== undefined)
            updateData.document = data.document?.trim() || null;
        if (data.email !== undefined)
            updateData.email = data.email?.trim() || null;
        if (data.phone !== undefined)
            updateData.phone = data.phone?.trim() || null;
        if (data.notes !== undefined)
            updateData.notes = data.notes?.trim() || null;
        return await prisma_js_1.prisma.contact.update({
            where: { id },
            data: updateData,
            include: {
                _count: { select: { receivables: true, bills: true } },
            },
        });
    }
    /**
     * Excluir contato (desvincula receivables e bills, não os exclui)
     */
    async deleteContact(userId, id) {
        const contact = await prisma_js_1.prisma.contact.findFirst({ where: { id, user_id: userId } });
        if (!contact) {
            return { success: true, message: 'Contato já foi excluído' };
        }
        // Desvincular receivables e bills antes de excluir o contato
        await prisma_js_1.prisma.receivable.updateMany({
            where: { contact_id: id, user_id: userId },
            data: { contact_id: null },
        });
        await prisma_js_1.prisma.bill.updateMany({
            where: { contact_id: id, user_id: userId },
            data: { contact_id: null },
        });
        await prisma_js_1.prisma.contact.delete({ where: { id } });
        return { success: true, message: 'Contato excluído com sucesso' };
    }
}
exports.ContactsService = ContactsService;
