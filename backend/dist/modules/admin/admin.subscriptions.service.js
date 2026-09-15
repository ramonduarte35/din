"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSubscriptionsService = exports.AdminSubscriptionsService = void 0;
const prisma_js_1 = require("../../lib/prisma.js");
const client_1 = require("@prisma/client");
class AdminSubscriptionsService {
    /**
     * Métricas executivas e KPIs de assinaturas e receita
     */
    async getOverview() {
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(in7Days.getDate() + 7);
        const [totalUsers, totalProUsers, totalFreeUsers, expiringSoonUsers, receivedPayments, recentPayments,] = await Promise.all([
            prisma_js_1.prisma.user.count(),
            prisma_js_1.prisma.user.count({
                where: {
                    subscription_tier: client_1.SubscriptionTier.PRO,
                    subscription_status: client_1.SubscriptionStatus.ACTIVE,
                    OR: [
                        { subscription_expires_at: null },
                        { subscription_expires_at: { gt: now } },
                    ],
                },
            }),
            prisma_js_1.prisma.user.count({
                where: { subscription_tier: client_1.SubscriptionTier.FREE },
            }),
            prisma_js_1.prisma.user.count({
                where: {
                    subscription_tier: client_1.SubscriptionTier.PRO,
                    subscription_expires_at: {
                        gt: now,
                        lte: in7Days,
                    },
                },
            }),
            prisma_js_1.prisma.subscriptionPayment.findMany({
                where: {
                    status: { in: [client_1.PaymentStatus.RECEIVED, client_1.PaymentStatus.CONFIRMED] },
                },
                select: { amount: true },
            }),
            prisma_js_1.prisma.subscriptionPayment.findMany({
                orderBy: { created_at: 'desc' },
                take: 10,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, phone_number: true },
                    },
                },
            }),
        ]);
        const totalRevenue = receivedPayments.reduce((acc, p) => acc + Number(p.amount), 0);
        const estimatedMrr = totalProUsers * 19.9;
        return {
            total_users: totalUsers,
            total_pro_users: totalProUsers,
            total_free_users: totalFreeUsers,
            expiring_soon_users: expiringSoonUsers,
            estimated_mrr: estimatedMrr,
            total_revenue: totalRevenue,
            recent_payments: recentPayments,
        };
    }
    /**
     * Listagem paginada de usuários com filtros de plano e status
     */
    async getUsers(query) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.search && query.search.trim()) {
            const search = query.search.trim();
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone_number: { contains: search } },
                { asaas_customer_id: { contains: search } },
            ];
        }
        if (query.tier && query.tier !== 'ALL') {
            where.subscription_tier = query.tier;
        }
        if (query.status && query.status !== 'ALL') {
            where.subscription_status = query.status;
        }
        const [total, users] = await Promise.all([
            prisma_js_1.prisma.user.count({ where }),
            prisma_js_1.prisma.user.findMany({
                where,
                orderBy: [{ role: 'desc' }, { created_at: 'desc' }],
                skip,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    telegram_id: true,
                    telegram_username: true,
                    avatar_url: true,
                    role: true,
                    subscription_tier: true,
                    subscription_status: true,
                    subscription_expires_at: true,
                    asaas_customer_id: true,
                    created_at: true,
                    _count: {
                        select: {
                            transactions: true,
                            bills: true,
                            payments: true,
                        },
                    },
                },
            }),
        ]);
        const now = new Date();
        const formattedUsers = users.map((u) => {
            let daysRemaining = null;
            let isExpired = false;
            if (u.subscription_expires_at) {
                const diff = u.subscription_expires_at.getTime() - now.getTime();
                daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
                isExpired = diff < 0;
            }
            return {
                ...u,
                days_remaining: daysRemaining,
                is_expired: isExpired,
            };
        });
        return {
            users: formattedUsers,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Gestão manual de assinatura de um usuário (conceder PRO, alterar validade ou rebaixar para Free)
     */
    async manageUserSubscription(userId, input, actorId) {
        const user = await prisma_js_1.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('Usuário não encontrado');
        }
        let newExpiresAt = user.subscription_expires_at;
        if (input.is_lifetime) {
            newExpiresAt = null; // Vitalício (sem expiração)
        }
        else if (input.days_to_add) {
            const base = user.subscription_expires_at && user.subscription_expires_at > new Date()
                ? new Date(user.subscription_expires_at)
                : new Date();
            base.setDate(base.getDate() + input.days_to_add);
            newExpiresAt = base;
        }
        else if (input.expires_at !== undefined) {
            newExpiresAt = input.expires_at ? new Date(input.expires_at) : null;
        }
        const updatedUser = await prisma_js_1.prisma.user.update({
            where: { id: userId },
            data: {
                subscription_tier: input.subscription_tier,
                subscription_status: input.subscription_status ||
                    (input.subscription_tier === client_1.SubscriptionTier.PRO
                        ? client_1.SubscriptionStatus.ACTIVE
                        : client_1.SubscriptionStatus.ACTIVE),
                subscription_expires_at: newExpiresAt,
            },
            select: {
                id: true,
                name: true,
                email: true,
                subscription_tier: true,
                subscription_status: true,
                subscription_expires_at: true,
            },
        });
        // Registrar ação no log de auditoria
        if (actorId) {
            await prisma_js_1.prisma.auditLog.create({
                data: {
                    userId: user.id,
                    actorId,
                    actorRole: 'ADMIN',
                    action: 'SUBSCRIPTION_MANUALLY_UPDATED',
                    resource: 'users',
                    resourceId: user.id,
                    diffPayload: {
                        before: {
                            tier: user.subscription_tier,
                            status: user.subscription_status,
                            expires_at: user.subscription_expires_at,
                        },
                        after: {
                            tier: updatedUser.subscription_tier,
                            status: updatedUser.subscription_status,
                            expires_at: updatedUser.subscription_expires_at,
                        },
                        notes: input.notes,
                    },
                },
            });
        }
        return updatedUser;
    }
    /**
     * Histórico detalhado de cobranças do Asaas
     */
    async getPayments(page = 1, limit = 20, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        const [total, payments] = await Promise.all([
            prisma_js_1.prisma.subscriptionPayment.count({ where }),
            prisma_js_1.prisma.subscriptionPayment.findMany({
                where,
                orderBy: { created_at: 'desc' },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone_number: true,
                        },
                    },
                },
            }),
        ]);
        return {
            payments,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
exports.AdminSubscriptionsService = AdminSubscriptionsService;
exports.adminSubscriptionsService = new AdminSubscriptionsService();
