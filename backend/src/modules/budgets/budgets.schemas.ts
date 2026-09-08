import { z } from 'zod';

export const listBudgetsQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
});

export const upsertBudgetSchema = z.object({
  category_id: z.string().uuid('ID de categoria inválido'),
  amount: z.number().positive('O valor do orçamento deve ser maior que zero'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
});

export const updateBudgetSchema = z.object({
  amount: z.number().positive('O valor do orçamento deve ser maior que zero'),
});

export const copyBudgetsSchema = z.object({
  target_month: z.number().int().min(1).max(12),
  target_year: z.number().int().min(2000).max(2100),
});

export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>;
export type UpsertBudgetInput = z.infer<typeof upsertBudgetSchema>;
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;
export type CopyBudgetsInput = z.infer<typeof copyBudgetsSchema>;
