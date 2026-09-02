"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listBillsQuerySchema = exports.payBillSchema = exports.updateBillSchema = exports.createBillSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createBillSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, 'Descrição é obrigatória').max(255),
    amount: zod_1.z.number().positive('Valor deve ser positivo'),
    due_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Data de vencimento inválida (use ISO-8601 ex: 2026-09-10)',
    }),
    category_id: zod_1.z.string().uuid('ID de categoria inválido').optional().nullable(),
    account_id: zod_1.z.string().uuid('ID de conta inválido').optional().nullable(),
    barcode: zod_1.z.string().max(255).optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    is_recurring: zod_1.z.boolean().optional(),
});
exports.updateBillSchema = zod_1.z.object({
    description: zod_1.z.string().min(1).max(255).optional(),
    amount: zod_1.z.number().positive().optional(),
    due_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Data de vencimento inválida',
    }).optional(),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    account_id: zod_1.z.string().uuid().optional().nullable(),
    barcode: zod_1.z.string().max(255).optional().nullable(),
    notes: zod_1.z.string().max(1000).optional().nullable(),
    is_recurring: zod_1.z.boolean().optional(),
    status: zod_1.z.nativeEnum(client_1.BillStatus).optional(),
});
exports.payBillSchema = zod_1.z.object({
    account_id: zod_1.z.string().uuid('ID da conta bancária de débito é obrigatório'),
    paid_date: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Data de pagamento inválida',
    }).optional(),
    amount: zod_1.z.number().positive('Valor pago deve ser positivo').optional(),
});
exports.listBillsQuerySchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.BillStatus).optional(),
    start_due_date: zod_1.z.string().optional(),
    end_due_date: zod_1.z.string().optional(),
    category_id: zod_1.z.string().uuid().optional(),
    account_id: zod_1.z.string().uuid().optional(),
    search: zod_1.z.string().optional(),
    month: zod_1.z.coerce.number().min(1).max(12).optional(),
    year: zod_1.z.coerce.number().min(2000).max(2100).optional(),
    page: zod_1.z.coerce.number().min(1).optional(),
    limit: zod_1.z.coerce.number().min(1).max(100).optional(),
});
