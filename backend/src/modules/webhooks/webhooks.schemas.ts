import { z } from 'zod';

// Schema para OpenAI Structured Outputs: Transações normais
export const aiExtractedTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.number().positive(),
  description: z.string(),
  suggested_category: z.string(),
  suggested_account: z.string().optional(),
  date: z.string().optional(),
});

// Schema para OpenAI Structured Outputs: Cadastro de Conta a Pagar
export const aiExtractedBillSchema = z.object({
  description: z.string(),
  amount: z.number().positive(),
  due_date: z.string(),
  suggested_category: z.string().optional(),
  barcode: z.string().optional(),
  notes: z.string().optional(),
});

// Schema para OpenAI Structured Outputs: Pagamento/Liquidação de Conta
export const aiExtractedPayBillSchema = z.object({
  search_term: z.string().optional(), // Nome da conta (ex: "luz", "faculdade", "aluguel")
  amount: z.number().positive().optional(),
  suggested_account: z.string().optional(), // Banco onde pagou (ex: "Nubank", "Banco do Brasil")
  paid_date: z.string().optional(),
});

export const aiExtractionResponseSchema = z.object({
  intent: z.enum(['transaction', 'balance_query', 'register_bill', 'query_bills', 'pay_bill', 'unknown']),
  query_period: z.enum(['current_month', 'today', 'all_time', 'upcoming_week']).optional(),
  query_account: z.string().optional(),
  transactions: z.array(aiExtractedTransactionSchema).optional(),
  bill_data: aiExtractedBillSchema.optional(),
  pay_bill_data: aiExtractedPayBillSchema.optional(),
});

export type AIExtractionResponse = z.infer<typeof aiExtractionResponseSchema>;
export type AIExtractedTransaction = z.infer<typeof aiExtractedTransactionSchema>;
export type AIExtractedBill = z.infer<typeof aiExtractedBillSchema>;
export type AIExtractedPayBill = z.infer<typeof aiExtractedPayBillSchema>;
