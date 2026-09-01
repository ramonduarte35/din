import { z } from 'zod';

// Schema para OpenAI Structured Outputs
export const aiExtractedTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive(),
  description: z.string(),
  suggested_category: z.string(),
  date: z.string().optional(),
});

export const aiExtractionResponseSchema = z.object({
  intent: z.enum(['transaction', 'balance_query', 'unknown']),
  query_period: z.enum(['current_month', 'today', 'all_time']).optional(),
  transactions: z.array(aiExtractedTransactionSchema).optional(),
});

export type AIExtractionResponse = z.infer<typeof aiExtractionResponseSchema>;
export type AIExtractedTransaction = z.infer<typeof aiExtractedTransactionSchema>;
