"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiExtractionResponseSchema = exports.aiExtractedPayBillSchema = exports.aiExtractedBillSchema = exports.aiExtractedTransactionSchema = void 0;
const zod_1 = require("zod");
// Schema para OpenAI Structured Outputs: Transações normais
exports.aiExtractedTransactionSchema = zod_1.z.object({
    type: zod_1.z.enum(['INCOME', 'EXPENSE']),
    amount: zod_1.z.number().positive(),
    description: zod_1.z.string(),
    suggested_category: zod_1.z.string(),
    suggested_account: zod_1.z.string().optional(),
    date: zod_1.z.string().optional(),
});
// Schema para OpenAI Structured Outputs: Cadastro de Conta a Pagar
exports.aiExtractedBillSchema = zod_1.z.object({
    description: zod_1.z.string(),
    amount: zod_1.z.number().positive(),
    due_date: zod_1.z.string(),
    suggested_category: zod_1.z.string().optional(),
    barcode: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
// Schema para OpenAI Structured Outputs: Pagamento/Liquidação de Conta
exports.aiExtractedPayBillSchema = zod_1.z.object({
    search_term: zod_1.z.string().optional(), // Nome da conta (ex: "luz", "faculdade", "aluguel")
    amount: zod_1.z.number().positive().optional(),
    suggested_account: zod_1.z.string().optional(), // Banco onde pagou (ex: "Nubank", "Banco do Brasil")
    paid_date: zod_1.z.string().optional(),
});
exports.aiExtractionResponseSchema = zod_1.z.object({
    intent: zod_1.z.enum(['transaction', 'balance_query', 'register_bill', 'query_bills', 'pay_bill', 'unknown']),
    query_period: zod_1.z.enum(['current_month', 'today', 'all_time', 'upcoming_week']).optional(),
    query_account: zod_1.z.string().optional(),
    transactions: zod_1.z.array(exports.aiExtractedTransactionSchema).optional(),
    bill_data: exports.aiExtractedBillSchema.optional(),
    pay_bill_data: exports.aiExtractedPayBillSchema.optional(),
});
