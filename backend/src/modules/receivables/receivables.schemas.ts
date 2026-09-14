import { z } from 'zod';
import { ReceivableStatus } from '@prisma/client';

export const createReceivableSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(255),
  amount: z.number().positive('Valor deve ser positivo'),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida (use ISO-8601 ex: 2026-09-10)',
  }),
  contact_id: z.string().uuid('ID de contato inválido').optional().nullable(),
  category_id: z.string().min(1, 'ID de categoria inválido').optional().nullable(),
  account_id: z.string().uuid('ID de conta inválido').optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_recurring: z.boolean().optional(),
  total_installments: z
    .number()
    .int()
    .min(1, 'Mínimo de 1 parcela')
    .max(120, 'Máximo de 120 parcelas')
    .optional()
    .default(1),
});

export const updateReceivableSchema = z.object({
  description: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  due_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Data de vencimento inválida' })
    .optional(),
  contact_id: z.string().uuid().optional().nullable(),
  category_id: z.string().min(1).optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_recurring: z.boolean().optional(),
  installment_number: z.number().int().min(1).optional().nullable(),
  total_installments: z.number().int().min(1).optional().nullable(),
  status: z.nativeEnum(ReceivableStatus).optional(),
});

export const receiveReceivableSchema = z.object({
  account_id: z.string().uuid('ID da conta bancária de crédito é obrigatório'),
  received_date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: 'Data de recebimento inválida' })
    .optional(),
  amount: z.number().positive('Valor recebido deve ser positivo').optional(),
});

export const listReceivablesQuerySchema = z.object({
  status: z.nativeEnum(ReceivableStatus).optional(),
  start_due_date: z.string().optional(),
  end_due_date: z.string().optional(),
  contact_id: z.string().uuid().optional(),
  category_id: z.string().min(1).optional(),
  account_id: z.string().uuid().optional(),
  search: z.string().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  _t: z.any().optional(),
});

export type CreateReceivableInput = z.infer<typeof createReceivableSchema>;
export type UpdateReceivableInput = z.infer<typeof updateReceivableSchema>;
export type ReceiveReceivableInput = z.infer<typeof receiveReceivableSchema>;
export type ListReceivablesQueryInput = z.infer<typeof listReceivablesQuerySchema>;
