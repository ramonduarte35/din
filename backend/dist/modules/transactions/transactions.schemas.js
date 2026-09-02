"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queryTransactionsSchema = exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createTransactionSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, 'A descrição é obrigatória'),
    amount: zod_1.z.number().positive('O valor deve ser positivo'),
    type: zod_1.z.nativeEnum(client_1.TransactionType),
    account_id: zod_1.z.string().uuid().optional().nullable(),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    date: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.updateTransactionSchema = zod_1.z.object({
    description: zod_1.z.string().min(1).optional(),
    amount: zod_1.z.number().positive().optional(),
    type: zod_1.z.nativeEnum(client_1.TransactionType).optional(),
    account_id: zod_1.z.string().uuid().optional().nullable(),
    category_id: zod_1.z.string().uuid().optional().nullable(),
    date: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.queryTransactionsSchema = zod_1.z.object({
    start_date: zod_1.z.string().optional(),
    end_date: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.TransactionType).optional(),
    account_id: zod_1.z.string().optional(),
    category_id: zod_1.z.string().optional(),
    origin: zod_1.z.nativeEnum(client_1.TransactionOrigin).optional(),
    page: zod_1.z.coerce.number().default(1),
    limit: zod_1.z.coerce.number().default(20),
    search: zod_1.z.string().optional(),
});
