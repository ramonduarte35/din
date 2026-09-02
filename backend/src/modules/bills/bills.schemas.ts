import { z } from 'zod';
import { BillStatus } from '@prisma/client';

export const createBillSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(255),
  amount: z.number().positive('Valor deve ser positivo'),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida (use ISO-8601 ex: 2026-09-10)',
  }),
  category_id: z.string().uuid('ID de categoria inválido').optional().nullable(),
  account_id: z.string().uuid('ID de conta inválido').optional().nullable(),
  barcode: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_recurring: z.boolean().optional(),
});

export const updateBillSchema = z.object({
  description: z.string().min(1).max(255).optional(),
  amount: z.number().positive().optional(),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de vencimento inválida',
  }).optional(),
  category_id: z.string().uuid().optional().nullable(),
  account_id: z.string().uuid().optional().nullable(),
  barcode: z.string().max(255).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_recurring: z.boolean().optional(),
  status: z.nativeEnum(BillStatus).optional(),
});

export const payBillSchema = z.object({
  account_id: z.string().uuid('ID da conta bancária de débito é obrigatório'),
  paid_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Data de pagamento inválida',
  }).optional(),
  amount: z.number().positive('Valor pago deve ser positivo').optional(),
});

export const listBillsQuerySchema = z.object({
  status: z.nativeEnum(BillStatus).optional(),
  start_due_date: z.string().optional(),
  end_due_date: z.string().optional(),
  category_id: z.string().uuid().optional(),
  account_id: z.string().uuid().optional(),
  search: z.string().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).max(2100).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export type CreateBillInput = z.infer<typeof createBillSchema>;
export type UpdateBillInput = z.infer<typeof updateBillSchema>;
export type PayBillInput = z.infer<typeof payBillSchema>;
export type ListBillsQueryInput = z.infer<typeof listBillsQuerySchema>;
