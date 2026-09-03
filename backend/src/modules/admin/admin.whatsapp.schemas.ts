import { z } from 'zod';

export const createInstanceSchema = z.object({
  instance_name: z
    .string()
    .min(3, 'O nome da instância deve ter pelo menos 3 caracteres.')
    .max(50, 'O nome da instância deve ter no máximo 50 caracteres.')
    .regex(/^[a-zA-Z0-9_-]+$/, 'O nome da instância deve conter apenas letras, números, hífen ou underline.'),
  phone_number: z.string().min(8, 'Número de telefone inválido.'),
  label: z.string().min(2, 'O rótulo deve ter pelo menos 2 caracteres.').max(100),
  is_active: z.boolean().default(true),
});

export const updateInstanceSchema = z.object({
  phone_number: z.string().min(8, 'Número de telefone inválido.').optional(),
  label: z.string().min(2).max(100).optional(),
  is_active: z.boolean().optional(),
});

export const logsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(30),
  page: z.coerce.number().min(1).default(1),
  status: z.enum(['SUCCESS', 'USER_NOT_FOUND', 'PRO_REQUIRED', 'PARSING_ERROR']).optional(),
  sender: z.string().optional(),
});

export const updateSystemSettingsSchema = z.object({
  reply_only_registered: z.boolean().optional(),
});

export const updateWhatsAppConfigSchema = z.object({
  active_provider: z.enum(['EVOLUTION', 'META_OFFICIAL']).optional(),
  meta_phone_number_id: z.string().optional().nullable(),
  meta_waba_id: z.string().optional().nullable(),
  meta_access_token: z.string().optional().nullable(),
  meta_verify_token: z.string().optional().nullable(),
  meta_app_secret: z.string().optional().nullable(),
});

export const testMetaConnectionSchema = z.object({
  meta_phone_number_id: z.string().optional(),
  meta_access_token: z.string().optional(),
});

export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type UpdateInstanceInput = z.infer<typeof updateInstanceSchema>;
export type LogsQueryInput = z.infer<typeof logsQuerySchema>;
export type UpdateSystemSettingsInput = z.infer<typeof updateSystemSettingsSchema>;
export type UpdateWhatsAppConfigInput = z.infer<typeof updateWhatsAppConfigSchema>;
export type TestMetaConnectionInput = z.infer<typeof testMetaConnectionSchema>;

