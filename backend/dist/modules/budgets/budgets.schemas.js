"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.copyBudgetsSchema = exports.updateBudgetSchema = exports.upsertBudgetSchema = exports.listBudgetsQuerySchema = void 0;
const zod_1 = require("zod");
exports.listBudgetsQuerySchema = zod_1.z.object({
    month: zod_1.z.coerce.number().int().min(1).max(12).optional(),
    year: zod_1.z.coerce.number().int().min(2000).max(2100).optional(),
});
exports.upsertBudgetSchema = zod_1.z.object({
    category_id: zod_1.z.string().min(1, 'ID de categoria inválido'),
    amount: zod_1.z.number().positive('O valor do orçamento deve ser maior que zero'),
    month: zod_1.z.number().int().min(1).max(12),
    year: zod_1.z.number().int().min(2000).max(2100),
});
exports.updateBudgetSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('O valor do orçamento deve ser maior que zero'),
});
exports.copyBudgetsSchema = zod_1.z.object({
    target_month: zod_1.z.number().int().min(1).max(12),
    target_year: zod_1.z.number().int().min(2000).max(2100),
});
