"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
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
                avatar_url: true,
                google_id: true,
                password_hash: true,
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
        const hasPassword = Boolean(user.password_hash);
        const { password_hash, ...userProfile } = user;
        return {
            ...userProfile,
            has_password: hasPassword,
        };
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
                avatar_url: true,
                google_id: true,
                password_hash: true,
                subscription_tier: true,
                role: true,
                updated_at: true,
            },
        });
        const hasPassword = Boolean(updatedUser.password_hash);
        const { password_hash, ...userProfile } = updatedUser;
        return {
            ...userProfile,
            has_password: hasPassword,
        };
    }
    async changePassword(userId, data) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw { statusCode: 404, message: 'Usuário não encontrado.' };
        }
        if (user.password_hash) {
            if (!data.current_password) {
                throw { statusCode: 400, message: 'A senha atual é obrigatória.' };
            }
            const passwordMatch = await bcryptjs_1.default.compare(data.current_password, user.password_hash);
            if (!passwordMatch) {
                throw { statusCode: 400, message: 'A senha atual fornecida está incorreta.' };
            }
            const isSamePassword = await bcryptjs_1.default.compare(data.new_password, user.password_hash);
            if (isSamePassword) {
                throw { statusCode: 400, message: 'A nova senha deve ser diferente da senha atual.' };
            }
        }
        const password_hash = await bcryptjs_1.default.hash(data.new_password, 10);
        await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: { password_hash },
        });
        return {
            message: user.password_hash ? 'Senha alterada com sucesso!' : 'Senha criada com sucesso!',
        };
    }
}
exports.UsersService = UsersService;
