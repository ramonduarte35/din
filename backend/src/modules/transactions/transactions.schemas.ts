import { z } from 'zod';
import { TransactionType, TransactionOrigin } from '@prisma/client';

export const createTransactionSchema = z.object({
  description: z.string().min(1, 'A descrição é obrigatória'),
  amount: z.number().positive('O valor deve ser positivo'),
  type: z.nativeEnum(TransactionType),
  category_id: z.string().uuid().optional().nullable(),
  date: z.string().or(z.date()).optional(),
});

export const updateTransactionSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  category_id: z.string().uuid().optional().nullable(),
  date: z.string().or(z.date()).optional(),
});

export const queryTransactionsSchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  type: z.nativeEnum(TransactionType).optional(),
  category_id: z.string().optional(),
  origin: z.nativeEnum(TransactionOrigin).optional(),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(20),
  search: z.string().optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type QueryTransactionsInput = z.infer<typeof queryTransactionsSchema>;
