"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logsQuerySchema = exports.updateInstanceSchema = exports.createInstanceSchema = void 0;
const zod_1 = require("zod");
exports.createInstanceSchema = zod_1.z.object({
    instance_name: zod_1.z
        .string()
        .min(3, 'O nome da instância deve ter pelo menos 3 caracteres.')
        .max(50, 'O nome da instância deve ter no máximo 50 caracteres.')
        .regex(/^[a-zA-Z0-9_-]+$/, 'O nome da instância deve conter apenas letras, números, hífen ou underline.'),
    phone_number: zod_1.z.string().min(8, 'Número de telefone inválido.'),
    label: zod_1.z.string().min(2, 'O rótulo deve ter pelo menos 2 caracteres.').max(100),
    is_active: zod_1.z.boolean().default(true),
});
exports.updateInstanceSchema = zod_1.z.object({
    phone_number: zod_1.z.string().min(8, 'Número de telefone inválido.').optional(),
    label: zod_1.z.string().min(2).max(100).optional(),
    is_active: zod_1.z.boolean().optional(),
});
exports.logsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().min(1).max(100).default(30),
    page: zod_1.z.coerce.number().min(1).default(1),
    status: zod_1.z.enum(['SUCCESS', 'USER_NOT_FOUND', 'PRO_REQUIRED', 'PARSING_ERROR']).optional(),
    sender: zod_1.z.string().optional(),
});
