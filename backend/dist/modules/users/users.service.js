"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const phone_js_1 = require("../../utils/phone.js");
class UsersService {
    async getProfile(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                subscription_tier: true,
                role: true,
                created_at: true,
                updated_at: true,
                _count: {
                    select: {
                        transactions: true,
                    },
                },
            },
        });
        if (!user) {
            throw { statusCode: 404, message: 'Usuário não encontrado.' };
        }
        return user;
    }
    async updateProfile(userId, data) {
        let normalizedPhone = undefined;
        if (data.phone_number !== undefined) {
            if (data.phone_number === null || data.phone_number.trim() === '') {
                normalizedPhone = null;
            }
            else {
                normalizedPhone = (0, phone_js_1.normalizePhoneNumber)(data.phone_number);
                const existing = await prisma_js_1.prisma.user.findFirst({
                    where: {
                        phone_number: normalizedPhone,
                        NOT: { id: userId },
                    },
                });
                if (existing) {
                    throw {
                        statusCode: 409,
                        message: 'Este número de WhatsApp já está em uso por outra conta.',
                    };
                }
            }
        }
        const updatedUser = await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                phone_number: normalizedPhone,
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                subscription_tier: true,
                role: true,
                updated_at: true,
            },
        });
        return updatedUser;
    }
}
exports.UsersService = UsersService;
