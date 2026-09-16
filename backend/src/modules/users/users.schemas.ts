import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
  phone_number: z.string().optional().nullable(),
  theme: z.enum(['dark', 'classic', 'emerald', 'midnight', 'minimalist', 'rose', 'light', 'purple']).optional(),
});

export const changePasswordSchema = z.object({
  current_password: z.string().optional(),
  new_password: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
});


export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const resetUserDataSchema = z.object({
  delete_transactions: z.boolean().default(true),
  delete_bills: z.boolean().default(true),
  delete_receivables: z.boolean().default(true),
  reset_account_balances: z.boolean().default(true),
  delete_budgets_and_goals: z.boolean().default(false),
  delete_categories: z.boolean().default(false),
  delete_contacts: z.boolean().default(false),
  confirmation: z.string().refine((val) => val === 'ZERAR' || val === 'LIMPAR', {
    message: 'Digite ZERAR ou LIMPAR para confirmar',
  }),
});

export type ResetUserDataInput = z.infer<typeof resetUserDataSchema>;
