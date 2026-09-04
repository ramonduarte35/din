import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'O título da meta é obrigatório'),
  target_amount: z.number().positive('O valor alvo deve ser positivo'),
  current_amount: z.number().min(0, 'O valor atual não pode ser negativo').optional().default(0),
  deadline: z.string().or(z.date()).optional().nullable(),
  icon: z.string().optional().default('Target'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor hex inválida').optional().default('#10b981'),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  is_completed: z.boolean().optional(),
});

export const depositGoalSchema = z.object({
  amount: z.number().positive('O valor do aporte deve ser positivo'),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type DepositGoalInput = z.infer<typeof depositGoalSchema>;
