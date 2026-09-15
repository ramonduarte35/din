"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryUsersSubscriptionSchema = exports.manageUserSubscriptionSchema = void 0;
const zod_1 = require("zod");
exports.manageUserSubscriptionSchema = zod_1.z.object({
    subscription_tier: zod_1.z.enum(['FREE', 'PRO']),
    subscription_status: zod_1.z.enum(['ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED']).optional(),
    // Duração em dias a partir de agora, ou data ISO específica, ou null para vitalício
    days_to_add: zod_1.z.number().int().min(1).max(3650).optional(),
    expires_at: zod_1.z.string().datetime().nullable().optional(),
    is_lifetime: zod_1.z.boolean().optional(),
    notes: zod_1.z.string().max(500).optional(),
});
exports.queryUsersSubscriptionSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    tier: zod_1.z.enum(['ALL', 'FREE', 'PRO']).default('ALL'),
    status: zod_1.z.enum(['ALL', 'ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'EXPIRED']).default('ALL'),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
