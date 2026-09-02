import { z } from 'zod';
import { AccountType } from '@prisma/client';

export const createAccountSchema = z.object({
  name: z.string().min(1, 'O nome da conta é obrigatório').max(50, 'Nome muito longo'),
  type: z.nativeEnum(AccountType).default(AccountType.CHECKING),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, 'Cor hexadecimal inválida').default('#10b981'),
  icon: z.string().default('Landmark'),
  initial_balance: z.number().default(0),
  is_default: z.boolean().default(false),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.nativeEnum(AccountType).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/).optional(),
  icon: z.string().optional(),
  initial_balance: z.number().optional(),
  is_default: z.boolean().optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
