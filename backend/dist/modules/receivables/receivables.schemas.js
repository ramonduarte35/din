"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReceivablesQuerySchema = exports.receiveReceivableSchema = exports.updateReceivableSchema = exports.createReceivableSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createReceivableSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, 'Descrição é obrigatória').max(255),
    amount: zod_1.z.number().positive('Valor deve ser positivo'),
    due_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Data de vencimento inválida (use ISO-8601 ex: 2026-09-10)',
    }),
    contact_id: zod_1.z.string().uuid('ID de contato inválido').optional().nullable(),
    category_id: zod_1.z.string().min(1, 'ID de categoria inválido').optional().nullable(),
    account_id: zod_1.z.string().uuid('ID de conta inválido').optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    is_recurring: zod_1.z.boolean().optional(),
    total_installments: zod_1.z
        .number()
        .int()
        .min(1, 'Mínimo de 1 parcela')
        .max(120, 'Máximo de 120 parcelas')
        .optional()
        .default(1),
});
exports.updateReceivableSchema = zod_1.z.object({
    description: zod_1.z.string().min(1).max(255).optional(),
    amount: zod_1.z.number().positive().optional(),
    due_date: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Data de vencimento inválida' })
        .optional(),
    contact_id: zod_1.z.string().uuid().optional().nullable(),
    category_id: zod_1.z.string().min(1).optional().nullable(),
    account_id: zod_1.z.string().uuid().optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    is_recurring: zod_1.z.boolean().optional(),
    installment_number: zod_1.z.number().int().min(1).optional().nullable(),
    total_installments: zod_1.z.number().int().min(1).optional().nullable(),
    status: zod_1.z.nativeEnum(client_1.ReceivableStatus).optional(),
});
exports.receiveReceivableSchema = zod_1.z.object({
    account_id: zod_1.z.string().uuid('ID da conta bancária de crédito é obrigatório'),
    received_date: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), { message: 'Data de recebimento inválida' })
        .optional(),
    amount: zod_1.z.number().positive('Valor recebido deve ser positivo').optional(),
});
exports.listReceivablesQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.ReceivableStatus).optional(),
    start_due_date: zod_1.z.string().optional(),
    end_due_date: zod_1.z.string().optional(),
    contact_id: zod_1.z.string().uuid().optional(),
    category_id: zod_1.z.string().min(1).optional(),
    account_id: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    month: zod_1.z.coerce.number().min(1).max(12).optional(),
    year: zod_1.z.coerce.number().min(2000).max(2100).optional(),
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
    _t: zod_1.z.any().optional(),
});
