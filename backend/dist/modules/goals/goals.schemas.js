"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositGoalSchema = exports.updateGoalSchema = exports.createGoalSchema = void 0;
const zod_1 = require("zod");
exports.createGoalSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'O título da meta é obrigatório'),
    target_amount: zod_1.z.number().positive('O valor alvo deve ser positivo'),
    current_amount: zod_1.z.number().min(0, 'O valor atual não pode ser negativo').optional().default(0),
    deadline: zod_1.z.string().or(zod_1.z.date()).optional().nullable(),
    icon: zod_1.z.string().optional().default('Target'),
    color: zod_1.z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor hex inválida').optional().default('#10b981'),
});
exports.updateGoalSchema = exports.createGoalSchema.partial().extend({
    is_completed: zod_1.z.boolean().optional(),
});
exports.depositGoalSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('O valor do aporte deve ser positivo'),
});
