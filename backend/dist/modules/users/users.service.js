"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_js_1 = require("../../lib/prisma.js");
const phone_js_1 = require("../../utils/phone.js");
const env_js_1 = require("../../config/env.js");
const client_1 = require("@prisma/client");
class UsersService {
    async getProfile(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone_number: true,
                telegram_id: true,
                telegram_username: true,
                avatar_url: true,
                google_id: true,
                password_hash: true,
                subscription_tier: true,
                role: true,
                theme: true,
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
        // Se o e-mail do usuário estiver no ADMIN_EMAIL do .env, garante privilégios ADMIN e PRO
        if ((0, env_js_1.isSystemAdminEmail)(user.email) && (user.role !== client_1.Role.ADMIN || user.subscription_tier !== client_1.SubscriptionTier.PRO)) {
            await prisma_js_1.prisma.user.update({
                where: { id: user.id },
                data: { role: client_1.Role.ADMIN, subscription_tier: client_1.SubscriptionTier.PRO },
            });
            user.role = client_1.Role.ADMIN;
            user.subscription_tier = client_1.SubscriptionTier.PRO;
        }
        const hasPassword = Boolean(user.password_hash);
        const { password_hash, ...userProfile } = user;
        return {
            ...userProfile,
            has_password: hasPassword,
            is_telegram_connected: Boolean(user.telegram_id),
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
                ...(data.name !== undefined && { name: data.name }),
                ...(normalizedPhone !== undefined && { phone_number: normalizedPhone }),
                ...(data.theme !== undefined && { theme: data.theme }),
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
                theme: true,
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
    async generateTelegramLinkCode(userId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw { statusCode: 404, message: 'Usuário não encontrado.' };
        }
        const config = await prisma_js_1.prisma.whatsAppIntegrationConfig.findFirst({
            orderBy: { created_at: 'desc' },
        });
        const botUsername = config?.telegram_bot_username?.replace(/^@/, '') || null;
        // Gerar código de 6 dígitos alfanuméricos
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const token = `v_${randomCode}`;
        // Armazenar no Redis por 15 minutos (900 segundos)
        try {
            const { redis } = await import('../../lib/redis.js');
            await redis.set(`tele_link:${token}`, userId, 'EX', 900);
            await redis.set(`tele_link:${randomCode}`, userId, 'EX', 900);
        }
        catch (e) {
            console.warn('⚠️ [Redis] Erro ao salvar token de vinculação do Telegram:', e);
        }
        const deepLink = botUsername ? `https://t.me/${botUsername}?start=${token}` : null;
        return {
            code: randomCode,
            token,
            deep_link: deepLink,
            bot_username: botUsername,
            expires_in_seconds: 900,
        };
    }
    async unlinkTelegram(userId) {
        await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: {
                telegram_id: null,
                telegram_username: null,
            },
        });
        return {
            message: 'Conta do Telegram desvinculada com sucesso!',
        };
    }
    async resetData(userId, options) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw { statusCode: 404, message: 'Usuário não encontrado.' };
        }
        const result = {};
        await prisma_js_1.prisma.$transaction(async (tx) => {
            // 1. Se delete_transactions for true
            if (options.delete_transactions) {
                // Desconectar transações das contas a pagar e receber se estas não forem excluídas
                await tx.bill.updateMany({
                    where: { user_id: userId },
                    data: { transaction_id: null },
                });
                await tx.receivable.updateMany({
                    where: { user_id: userId },
                    data: { transaction_id: null },
                });
                const deletedTx = await tx.transaction.deleteMany({
                    where: { user_id: userId },
                });
                result.deleted_transactions = deletedTx.count;
            }
            // 2. Se delete_bills for true
            if (options.delete_bills) {
                const deletedBills = await tx.bill.deleteMany({
                    where: { user_id: userId },
                });
                result.deleted_bills = deletedBills.count;
            }
            // 3. Se delete_receivables for true
            if (options.delete_receivables) {
                const deletedReceivables = await tx.receivable.deleteMany({
                    where: { user_id: userId },
                });
                result.deleted_receivables = deletedReceivables.count;
            }
            // 4. Se reset_account_balances for true (mantém as contas, apenas zera initial_balance)
            if (options.reset_account_balances) {
                const updatedAccounts = await tx.account.updateMany({
                    where: { user_id: userId },
                    data: { initial_balance: 0 },
                });
                result.reset_accounts = updatedAccounts.count;
            }
            // 5. Se delete_budgets_and_goals for true
            if (options.delete_budgets_and_goals) {
                const deletedBudgets = await tx.budget.deleteMany({
                    where: { user_id: userId },
                });
                const deletedGoals = await tx.goal.deleteMany({
                    where: { user_id: userId },
                });
                result.deleted_budgets = deletedBudgets.count;
                result.deleted_goals = deletedGoals.count;
            }
            // 6. Se delete_categories for true (apenas categorias criadas pelo próprio usuário)
            if (options.delete_categories) {
                if (!options.delete_transactions) {
                    await tx.transaction.updateMany({
                        where: { user_id: userId },
                        data: { category_id: null },
                    });
                }
                if (!options.delete_bills) {
                    await tx.bill.updateMany({
                        where: { user_id: userId },
                        data: { category_id: null },
                    });
                }
                if (!options.delete_receivables) {
                    await tx.receivable.updateMany({
                        where: { user_id: userId },
                        data: { category_id: null },
                    });
                }
                await tx.budget.deleteMany({
                    where: { user_id: userId },
                });
                const deletedCats = await tx.category.deleteMany({
                    where: { user_id: userId },
                });
                result.deleted_categories = deletedCats.count;
            }
            // 7. Se delete_contacts for true
            if (options.delete_contacts) {
                if (!options.delete_bills) {
                    await tx.bill.updateMany({
                        where: { user_id: userId },
                        data: { contact_id: null },
                    });
                }
                if (!options.delete_receivables) {
                    await tx.receivable.updateMany({
                        where: { user_id: userId },
                        data: { contact_id: null },
                    });
                }
                const deletedContacts = await tx.contact.deleteMany({
                    where: { user_id: userId },
                });
                result.deleted_contacts = deletedContacts.count;
            }
        });
        // Invalida cache do Redis
        try {
            const { redis } = await import('../../lib/redis.js');
            const keys = await redis.keys(`summary:${userId}:*`);
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        }
        catch (e) {
            // Falha silenciosa do cache
        }
        return {
            success: true,
            message: 'Limpeza financeira realizada com sucesso.',
            details: result,
        };
    }
}
exports.UsersService = UsersService;
