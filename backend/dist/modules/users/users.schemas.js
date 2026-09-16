"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetUserDataSchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
    phone_number: zod_1.z.string().optional().nullable(),
    theme: zod_1.z.enum(['dark', 'classic', 'emerald', 'midnight', 'minimalist', 'rose', 'light', 'purple']).optional(),
});
exports.changePasswordSchema = zod_1.z.object({
    current_password: zod_1.z.string().optional(),
    new_password: zod_1.z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});
exports.resetUserDataSchema = zod_1.z.object({
    delete_transactions: zod_1.z.boolean().default(true),
    delete_bills: zod_1.z.boolean().default(true),
    delete_receivables: zod_1.z.boolean().default(true),
    reset_account_balances: zod_1.z.boolean().default(true),
    delete_budgets_and_goals: zod_1.z.boolean().default(false),
    delete_categories: zod_1.z.boolean().default(false),
    delete_contacts: zod_1.z.boolean().default(false),
    confirmation: zod_1.z.string().refine((val) => val === 'ZERAR' || val === 'LIMPAR', {
        message: 'Digite ZERAR ou LIMPAR para confirmar',
    }),
});
