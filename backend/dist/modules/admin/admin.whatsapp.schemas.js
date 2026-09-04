"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTelegramWebhookSchema = exports.testTelegramConnectionSchema = exports.testMetaConnectionSchema = exports.updateWhatsAppConfigSchema = exports.updateSystemSettingsSchema = exports.logsQuerySchema = exports.updateInstanceSchema = exports.createInstanceSchema = void 0;
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
exports.updateSystemSettingsSchema = zod_1.z.object({
    reply_only_registered: zod_1.z.boolean().optional(),
});
exports.updateWhatsAppConfigSchema = zod_1.z.object({
    active_provider: zod_1.z.enum(['EVOLUTION', 'META_OFFICIAL']).optional(),
    meta_phone_number_id: zod_1.z.string().optional().nullable(),
    meta_waba_id: zod_1.z.string().optional().nullable(),
    meta_access_token: zod_1.z.string().optional().nullable(),
    meta_verify_token: zod_1.z.string().optional().nullable(),
    meta_app_secret: zod_1.z.string().optional().nullable(),
    telegram_bot_token: zod_1.z.string().optional().nullable(),
    telegram_bot_username: zod_1.z.string().optional().nullable(),
    telegram_is_active: zod_1.z.boolean().optional(),
    telegram_webhook_secret: zod_1.z.string().optional().nullable(),
});
exports.testMetaConnectionSchema = zod_1.z.object({
    meta_phone_number_id: zod_1.z.string().optional(),
    meta_access_token: zod_1.z.string().optional(),
});
exports.testTelegramConnectionSchema = zod_1.z.object({
    telegram_bot_token: zod_1.z.string().optional(),
});
exports.setTelegramWebhookSchema = zod_1.z.object({
    webhook_url: zod_1.z.string().url('URL de webhook inválida.').optional(),
    secret_token: zod_1.z.string().optional(),
    telegram_bot_token: zod_1.z.string().optional(),
});
